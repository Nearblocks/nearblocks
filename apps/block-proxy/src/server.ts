import { timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from 'nb-logger';

import { parseJsonPreservingUnsafeIntegers } from '#indexer/rpc';
import * as metrics from '#metrics';
import type { AppState } from '#state';
import { type UpstreamError, UpstreamRedirectError } from '#types';
import { fetchBlockDeduped } from '#upstream/index';

const MAX_BLOCK_HEIGHT = 1_000_000_000_000_000n;
const MAX_U64 = 18_446_744_073_709_551_615n;
const DAY_SECONDS = 24 * 60 * 60;
// Kept short until node-built blocks have proven themselves: a shared cache
// in front must not pin a bad block for long.
const BLOCK_MAX_AGE_SECS = 60;
const MAX_BEHIND_HEAD_RETRIES = 3;
// Wait on the node for a near-tip block well below a downstream proxy's
// timeout, so this proxy answers (and the caller falls back) first.
const NODE_TIP_WAIT_MS = 3000;
const LAST_BLOCK_CACHE_MS = 100;
// A head seen this recently already proves a higher height is in the future.
const MISS_HEAD_MAX_AGE_MS = 1000;
const RPC_METHOD_NOT_ALLOWED = -32601;
const MAX_RPC_BATCH = 100;

function parseU64(value: string): bigint | null {
  if (!/^\d+$/.test(value)) return null;
  try {
    const height = BigInt(value);
    return height <= MAX_U64 ? height : null;
  } catch {
    return null;
  }
}

function querySuffix(req: express.Request): string {
  const queryIndex = req.originalUrl.indexOf('?');
  return queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
}

function isApiKeyParameter(name: string): boolean {
  return (
    name.replaceAll('_', '').replaceAll('-', '').toLowerCase() === 'apikey'
  );
}

function suppliedApiKey(req: express.Request): string | undefined {
  const authorization = req.get('authorization');
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) return bearer;
  const headerKey = req.get('x-api-key');
  if (headerKey) return headerKey;
  for (const [name, value] of new URLSearchParams(querySuffix(req))) {
    if (isApiKeyParameter(name)) return value;
  }
  return undefined;
}

function keyMatches(actual: string | undefined, expected: string): boolean {
  if (!actual) return false;
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

/** Client keys; PROXY_API_KEY alone is a single client named "default". */
function proxyClients(
  config: AppState['config'],
): Array<{ key: string; name: string }> {
  return (
    config.proxyClients ??
    (config.proxyApiKey ? [{ key: config.proxyApiKey, name: 'default' }] : [])
  );
}

function upstreamRedirectLocation(
  req: express.Request,
  location: string,
): string {
  // An invalid Host header must not throw: fall back to a base that can never
  // match an upstream origin.
  let base = 'http://invalid.invalid';
  try {
    base = new URL(`${req.protocol}://${req.get('host')}`).origin;
  } catch {
    // Keep the fallback base.
  }
  const target = new URL(location, base);
  const sameOrigin = target.origin === new URL(base).origin;
  for (const name of [...target.searchParams.keys()]) {
    if (isApiKeyParameter(name)) target.searchParams.delete(name);
  }
  for (const [name, value] of new URLSearchParams(querySuffix(req))) {
    if (sameOrigin || !isApiKeyParameter(name))
      target.searchParams.append(name, value);
  }
  return /^https?:\/\//i.test(location)
    ? target.toString()
    : `${target.pathname}${target.search}${target.hash}`;
}

function jsonStringError(res: express.Response, status: number, body: string) {
  res.status(status).type('application/json').send(JSON.stringify(body));
}

function sendRateLimit(
  res: express.Response,
  errors: UpstreamError[],
): boolean {
  const error = [...errors].reverse().find((item) => item.status === 429);
  if (!error) return false;
  res.status(429).set('cache-control', 'no-store');
  if (error.retryAfter) res.set('retry-after', error.retryAfter);
  if (error.contentType) res.set('content-type', error.contentType);
  res.send(error.body || JSON.stringify('Too Many Requests'));
  return true;
}

function typedHeightError(
  res: express.Response,
  error: string,
  type: 'BLOCK_DOES_NOT_EXIST' | 'BLOCK_HEIGHT_TOO_HIGH',
): void {
  // A future block will exist soon; only permanent misses may be cached.
  const cacheControl =
    type === 'BLOCK_DOES_NOT_EXIST' ? 'no-store' : cacheFor(res, DAY_SECONDS);
  res.status(404).set('cache-control', cacheControl).json({ error, type });
}

type RpcRequestCheck =
  | { batch: boolean; ids: unknown[]; ok: false; reason: 'not-allowed' }
  | { body: Buffer; method: string; ok: true }
  | { ok: false; reason: 'invalid' };

/** Validate the JSON-RPC body against the method allowlist. */
function checkRpcRequest(body: Buffer, allowed: Set<string>): RpcRequestCheck {
  let payload: unknown;
  try {
    // Keep integers outside the safe range exact; the body is re-serialized.
    payload = parseJsonPreservingUnsafeIntegers(body.toString('utf8'));
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const batch = Array.isArray(payload);
  const entries: unknown[] = Array.isArray(payload) ? payload : [payload];
  if (
    entries.length === 0 ||
    entries.length > MAX_RPC_BATCH ||
    entries.some(
      (entry) =>
        typeof entry !== 'object' ||
        entry === null ||
        Array.isArray(entry) ||
        typeof (entry as { method?: unknown }).method !== 'string',
    )
  )
    return { ok: false, reason: 'invalid' };

  const requests = entries as Array<{ id?: unknown; method: string }>;
  // Forward what was checked, not the raw bytes: with duplicate keys the
  // allowlist (last key wins) and the node's parser could disagree.
  if (requests.every((request) => allowed.has(request.method)))
    return {
      body: Buffer.from(JSON.stringify(payload)),
      // Allowlisted, so a bounded metric label.
      method: batch ? 'batch' : requests[0].method,
      ok: true,
    };
  return {
    batch,
    ids: requests.map((request) => request.id ?? null),
    ok: false,
    reason: 'not-allowed',
  };
}

function rpcError(id: unknown, code: number, message: string) {
  return { error: { code, message }, id, jsonrpc: '2.0' };
}

/**
 * Cache-Control for a response. With a client key the data is served only to
 * key holders, so shared caches (which key on the URL alone) must not store
 * it and replay it to clients without a key.
 */
function cacheFor(res: express.Response, maxAgeSecs: number): string {
  const scope = res.locals.cacheScope === 'private' ? 'private' : 'public';
  return `${scope}, max-age=${maxAgeSecs}`;
}

/** Express 4 does not catch rejected async handlers; route them to `next`. */
function route(
  handler: (req: express.Request, res: express.Response) => Promise<void>,
): express.RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createDataServer(state: AppState): express.Express {
  const app = express();
  let cachedHead: { height: number; ts: number } | null = null;
  let headRequest: null | Promise<number> = null;
  let highestFinalizedHeight = 0;

  app.use((req, res, next) => {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'GET, POST');
    res.setHeader(
      'access-control-allow-headers',
      'Content-Type, Authorization, Accept, X-API-Key',
    );
    res.setHeader('access-control-max-age', '3600');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  app.use((req, res, next) => {
    const clients = proxyClients(state.config);
    res.locals.client = 'anonymous';
    if (clients.length && req.path !== '/healthz' && req.path !== '/readyz') {
      const supplied = suppliedApiKey(req);
      const client = clients.find(({ key }) => keyMatches(supplied, key));
      if (!client) {
        jsonStringError(res, 403, 'Forbidden');
        return;
      }
      res.locals.client = client.name;
    }
    if (clients.length) res.locals.cacheScope = 'private';
    res.setHeader('x-content-type-options', 'nosniff');
    next();
  });

  app.use((req, res, next) => {
    const incomingRequestId = req.headers['x-request-id'];
    const requestId =
      (Array.isArray(incomingRequestId)
        ? incomingRequestId[0]
        : incomingRequestId) || uuidv4();
    res.setHeader('x-request-id', String(requestId));
    next();
  });

  async function getFinalizedHeight(): Promise<number> {
    if (cachedHead && Date.now() - cachedHead.ts < LAST_BLOCK_CACHE_MS)
      return cachedHead.height;
    if (headRequest) return headRequest;

    headRequest = (async () => {
      const failures: UpstreamError[] = [];
      for (const source of state.config.blockSources) {
        try {
          let height: null | number = null;
          if (source === 'node') {
            height = state.localIndexer?.currentFinalizedHeight() ?? null;
          } else if (source === 'proxy') {
            height = await state.blockProxy.fetchLastBlockHeight('final');
          } else if (source === 'neardata') {
            height = await state.neardata.fetchLastBlockHeight('final');
          }
          if (height === null) continue;
          highestFinalizedHeight = Math.max(highestFinalizedHeight, height);
          const result = highestFinalizedHeight;
          state.tipHeight = Math.max(state.tipHeight, result);
          metrics.tipHeight.set(state.tipHeight);
          cachedHead = { height: result, ts: Date.now() };
          return result;
        } catch (error) {
          const upstreamError = error as Error & {
            body?: string;
            contentType?: string;
            notFound?: boolean;
            retryAfter?: string;
            status?: number;
          };
          failures.push({
            body: upstreamError.body,
            contentType: upstreamError.contentType,
            error: String(error),
            notFound: upstreamError.notFound,
            retryAfter: upstreamError.retryAfter,
            source,
            status: upstreamError.status,
          });
        }
      }
      const error = new Error(
        failures.map(({ error: message }) => message).join('; ') ||
          'no finalized head source available',
      ) as Error & { errors: UpstreamError[] };
      error.errors = failures;
      throw error;
    })().finally(() => {
      headRequest = null;
    });
    return headRequest;
  }

  app.post(
    '/rpc',
    express.raw({ limit: '10mb', type: '*/*' }),
    route(async (req, res) => {
      metrics.requests.inc({ endpoint: 'rpc' });
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      const check = checkRpcRequest(
        body,
        new Set(state.config.rpcAllowedMethods),
      );
      // Only allowlisted method names become label values.
      const method = check.ok
        ? check.method
        : check.reason === 'invalid'
          ? 'invalid'
          : 'other';
      const record = (result: string) =>
        metrics.rpcRequests.inc({
          client: String(res.locals.client),
          method,
          result,
        });
      if (!check.ok) {
        record(check.reason === 'invalid' ? 'invalid' : 'not_allowed');
        if (check.reason === 'invalid') {
          res
            .status(400)
            .set('cache-control', 'no-store')
            .json(rpcError(null, -32700, 'Invalid JSON-RPC request'));
          return;
        }
        // An application-level answer: clients must not fail over on it.
        const errors = check.ids.map((id) =>
          rpcError(
            id,
            RPC_METHOD_NOT_ALLOWED,
            'Method not found or not allowed',
          ),
        );
        res
          .status(200)
          .set('cache-control', 'no-store')
          .json(check.batch ? errors : errors[0]);
        return;
      }
      // The guard needs the node source: without a local indexer there is no
      // view of the node's lag and requests are forwarded as-is.
      if (state.localIndexer && !state.localIndexer.isNodeCurrent()) {
        record('out_of_sync');
        res
          .status(503)
          .set('cache-control', 'no-store')
          .type('text/plain')
          .send('RPC node out of sync');
        return;
      }
      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, state.config.upstreamTimeoutMs);
      const abortForClient = () => controller.abort();
      req.once('aborted', abortForClient);
      res.once('close', () => {
        if (!res.writableEnded) abortForClient();
      });

      const startedAt = Date.now();
      try {
        const upstream = await fetch(state.config.nodeRpcUrl, {
          body: check.body,
          headers: {
            accept: req.get('accept') ?? 'application/json',
            ...(state.config.nodeRpcApiKey
              ? { authorization: `Bearer ${state.config.nodeRpcApiKey}` }
              : {}),
            'content-type': req.get('content-type') ?? 'application/json',
          },
          method: 'POST',
          signal: controller.signal,
        });
        // The timeout covers waiting for the node to answer, not a client
        // slowly downloading a large response.
        clearTimeout(timeout);
        metrics.rpcDuration.observe(
          { method },
          (Date.now() - startedAt) / 1000,
        );
        record(upstream.ok ? 'ok' : 'upstream_error');
        res.status(upstream.status).set('cache-control', 'no-store');
        const contentType = upstream.headers.get('content-type');
        if (contentType) res.set('content-type', contentType);
        if (!upstream.body) {
          res.end();
          return;
        }
        await pipeline(Readable.fromWeb(upstream.body), res);
      } catch (error) {
        // `req.destroyed` is also true once the request body was consumed, so
        // only a closed response or a client-initiated abort means the caller
        // is gone.
        if (res.destroyed || (controller.signal.aborted && !timedOut)) return;
        if (res.headersSent) {
          res.destroy(error instanceof Error ? error : undefined);
          return;
        }
        const status = timedOut ? 504 : 502;
        record(timedOut ? 'timeout' : 'upstream_error');
        logger.warn(
          { error: String(error), status },
          'node rpc proxy request failed',
        );
        // Deliberately not a JSON-RPC body: JSON-RPC clients treat an error
        // object as an application answer and would not fail over.
        res
          .status(status)
          .set('cache-control', 'no-store')
          .type('text/plain')
          .send(
            timedOut ? 'RPC upstream timed out' : 'RPC upstream unavailable',
          );
      } finally {
        clearTimeout(timeout);
        req.off('aborted', abortForClient);
      }
    }),
  );

  app.get(
    '/v0/last_block/final',
    route(async (req, res) => {
      metrics.requests.inc({ endpoint: 'last_block' });
      state.stats.requestsLastBlock++;
      try {
        const height = await getFinalizedHeight();
        res
          .status(302)
          .set('location', `/v0/block/${height}${querySuffix(req)}`)
          .end();
      } catch (error) {
        logger.error({ error: String(error) }, 'finalized head lookup failed');
        const errors =
          (error as Error & { errors?: UpstreamError[] }).errors ?? [];
        if (sendRateLimit(res, errors)) return;
        jsonStringError(res, 503, 'Internal data error');
      }
    }),
  );

  app.get(
    '/v0/block/:height',
    route(async (req, res) => {
      const parsedHeight = parseU64(req.params.height);
      if (parsedHeight === null) {
        jsonStringError(res, 400, 'Invalid argument');
        return;
      }
      if (parsedHeight > MAX_BLOCK_HEIGHT) {
        typedHeightError(
          res,
          'Block height is too high',
          'BLOCK_HEIGHT_TOO_HIGH',
        );
        return;
      }
      const height = Number(parsedHeight);
      metrics.requests.inc({ endpoint: 'block' });
      state.stats.requestsBlock++;
      let clientDisconnected = false;
      let behindHeadRetries = 0;
      let nodeWaitStartedAt: null | number = null;
      let finalNodeRecheck = false;
      let skipNodeAfterWait = false;
      res.once('close', () => {
        clientDisconnected = true;
      });

      for (;;) {
        if (clientDisconnected || req.destroyed) return;
        try {
          const { bytes, source } = await fetchBlockDeduped(
            state,
            height,
            'final',
            skipNodeAfterWait,
          );
          state.tipHeight = Math.max(state.tipHeight, height);
          metrics.tipHeight.set(state.tipHeight);
          res
            .status(200)
            .set('content-type', 'application/json; charset=utf-8')
            .set('cache-control', cacheFor(res, BLOCK_MAX_AGE_SECS))
            .set('x-upstream-source', source)
            .send(bytes);
          metrics.blocksServed.inc({
            client: String(res.locals.client),
            source,
          });
          return;
        } catch (error: unknown) {
          if (error instanceof UpstreamRedirectError) {
            res
              .status(error.status)
              .set('cache-control', cacheFor(res, BLOCK_MAX_AGE_SECS))
              .set('location', upstreamRedirectLocation(req, error.location))
              .end();
            return;
          }
          const upstreamError = error as Error & { errors?: UpstreamError[] };
          const errors = upstreamError.errors ?? [];
          if (errors.some((item) => item.pending)) {
            if (finalNodeRecheck) {
              skipNodeAfterWait = true;
              continue;
            }
            nodeWaitStartedAt ??= Date.now();
            if (
              Date.now() - nodeWaitStartedAt >=
              Math.min(state.config.upstreamTimeoutMs, NODE_TIP_WAIT_MS)
            ) {
              finalNodeRecheck = true;
              continue;
            }
            await sleep(state.config.indexerIntervalMs);
            continue;
          }
          if (sendRateLimit(res, errors)) return;
          // The node only holds recent blocks. Answer an older miss at once,
          // and as a miss: a downstream proxy then tries its next source
          // instead of putting this one in cooldown as if it were down.
          if (errors.length > 0 && errors.every((item) => item.notHeld)) {
            res.status(404).set('cache-control', 'no-store').json({
              error: 'Block is older than this proxy holds',
              type: 'BLOCK_NOT_HELD',
            });
            return;
          }
          const allNotFound =
            errors.length > 0 && errors.every((item) => item.notFound);
          if (!allNotFound) {
            logger.error(
              { errors, height },
              'block request failed: all sources exhausted',
            );
            jsonStringError(res, 502, 'all upstream sources failed');
            return;
          }

          // Most misses are the next block at the tip, polled by every
          // indexer. Answer them from a fresh head instead of looking it up
          // (a paid neardata request): at worst a client retries a block that
          // has just appeared, as it would anyway.
          if (
            cachedHead &&
            height > highestFinalizedHeight &&
            Date.now() - cachedHead.ts < MISS_HEAD_MAX_AGE_MS
          ) {
            typedHeightError(
              res,
              'The block is too far in the future',
              'BLOCK_DOES_NOT_EXIST',
            );
            return;
          }

          let finalizedHeight = 0;
          try {
            finalizedHeight = Math.max(
              finalizedHeight,
              await getFinalizedHeight(),
            );
          } catch (headError) {
            logger.warn(
              { error: String(headError), height },
              'could not confirm finalized height',
            );
            const headErrors =
              (headError as Error & { errors?: UpstreamError[] }).errors ?? [];
            if (sendRateLimit(res, headErrors)) return;
            jsonStringError(res, 503, 'Internal data error');
            return;
          }
          // A head observed after the block lookup does not prove that the
          // missing height was skipped. It may have been published in between.
          // Only return null when a source explicitly reports a skipped height.
          if (height <= finalizedHeight) {
            behindHeadRetries++;
            if (behindHeadRetries >= MAX_BEHIND_HEAD_RETRIES) {
              logger.error(
                { finalizedHeight, height, retries: behindHeadRetries },
                'block remained unavailable below the finalized head',
              );
              jsonStringError(res, 502, 'all upstream sources failed');
              return;
            }
            await sleep(1000);
            continue;
          }
          typedHeightError(
            res,
            'The block is too far in the future',
            'BLOCK_DOES_NOT_EXIST',
          );
          return;
        }
      }
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({
      status: 'ok',
      uptime_secs: Math.floor((Date.now() - state.startTime) / 1000),
      version: state.version,
    });
  });
  app.get('/readyz', (_req, res) => {
    res.status(state.ready ? 200 : 503).json({ ready: state.ready });
  });

  return app;
}
