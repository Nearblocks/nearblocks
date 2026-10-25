import { logger } from 'nb-logger';

import * as metrics from '#metrics';
import type { AppState } from '#state';
import { type UpstreamError, UpstreamRedirectError } from '#types';

const MAX_NODE_TIP_WAIT_AHEAD = 3;

function recordUpstreamOk(
  state: AppState,
  source: string,
  elapsedMs: number,
): void {
  const durationSecs = elapsedMs / 1000;
  const durationUs = elapsedMs * 1000;

  metrics.upstreamRequests.inc({ result: 'ok', source });
  metrics.upstreamDuration.observe({ source }, durationSecs);

  switch (source) {
    case 'neardata':
      state.stats.upstreamRequestsNeardata++;
      state.stats.upstreamDurationUsNeardata += durationUs;
      break;
    case 'proxy':
      state.stats.upstreamRequestsProxy++;
      state.stats.upstreamDurationUsProxy += durationUs;
      break;
  }
}

function recordUpstreamFailure(
  state: AppState,
  source: string,
  elapsedMs: number,
  notFound: boolean,
): void {
  const durationSecs = elapsedMs / 1000;
  const durationUs = elapsedMs * 1000;

  metrics.upstreamRequests.inc({
    result: notFound ? 'not_found' : 'error',
    source,
  });
  metrics.upstreamDuration.observe({ source }, durationSecs);

  switch (source) {
    case 'neardata':
      state.stats.upstreamRequestsNeardata++;
      if (!notFound) state.stats.upstreamErrorsNeardata++;
      state.stats.upstreamDurationUsNeardata += durationUs;
      break;
    case 'proxy':
      state.stats.upstreamRequestsProxy++;
      if (!notFound) state.stats.upstreamErrorsProxy++;
      state.stats.upstreamDurationUsProxy += durationUs;
      break;
  }
}

function recordUpstreamRedirect(
  state: AppState,
  source: string,
  elapsedMs: number,
): void {
  metrics.upstreamRequests.inc({ result: 'redirect', source });
  metrics.upstreamDuration.observe({ source }, elapsedMs / 1000);
  if (source === 'neardata' || source === 'proxy') {
    const key = source === 'proxy' ? 'Proxy' : 'Neardata';
    state.stats[`upstreamRequests${key}` as const]++;
    state.stats[`upstreamDurationUs${key}` as const] += elapsedMs * 1000;
  }
}

function toUpstreamError(error: unknown, source: string): UpstreamError {
  const upstreamError = error as Error & {
    body?: string;
    contentType?: string;
    notFound?: boolean;
    retryAfter?: string;
    status?: number;
  };
  return {
    body: upstreamError.body,
    contentType: upstreamError.contentType,
    error: String(error),
    notFound: upstreamError.notFound,
    retryAfter: upstreamError.retryAfter,
    source,
    status: upstreamError.status,
  };
}

function isJsonNull(bytes: Buffer): boolean {
  return bytes.toString('utf8').trim() === 'null';
}

function validateBlockBytes(
  height: number,
  bytes: Buffer,
  source: string,
): void {
  if (isJsonNull(bytes)) return;
  let value: {
    block?: { header?: { hash?: unknown; height?: unknown } };
    shards?: unknown;
  };
  try {
    value = JSON.parse(bytes.toString('utf8')) as typeof value;
  } catch (error) {
    throw new Error(
      `${source} returned invalid JSON for block ${height}: ${error}`,
    );
  }
  if (
    value?.block?.header?.height !== height ||
    typeof value.block.header.hash !== 'string' ||
    !value.block.header.hash ||
    !Array.isArray(value.shards)
  ) {
    throw new Error(
      `${source} returned invalid block data for height ${height}`,
    );
  }
}

export async function fetchBlock(
  state: AppState,
  height: number,
  finality: 'final' | 'optimistic' = 'final',
  skipNode = false,
): Promise<{ bytes: Buffer; source: string }> {
  const errors: UpstreamError[] = [];
  const start = Date.now();

  // 1. Local filesystem cache
  if (finality === 'final' && state.config.cacheEnabled) {
    try {
      const cached = await state.cache.read(height);
      if (cached) {
        metrics.cacheHits.inc();
        state.stats.cacheHits++;
        logger.info(
          { height, latency_ms: Date.now() - start, source: 'cache' },
          'block served',
        );
        // Upstream bytes are validated before they are cached, so a hit is not
        // parsed again. On a node-only proxy every cached block was built by
        // the node; say so, so a downstream shadow can tell.
        const nodeOnly =
          state.config.blockSources.length === 1 &&
          state.config.blockSources[0] === 'node';
        return { bytes: cached, source: nodeOnly ? 'node' : 'cache' };
      }
      metrics.cacheMisses.inc();
      state.stats.cacheMisses++;
    } catch (err) {
      metrics.cacheMisses.inc();
      state.stats.cacheMisses++;
      logger.warn({ error: String(err), height }, 'cache read error');
      // Cache errors tracked separately — don't include in upstream errors
      // to avoid affecting 404 vs 502 classification
    }
  }

  let redirect: null | UpstreamRedirectError = null;
  let proxyNull: Buffer | null = null;
  const sources = state.config.blockSources;
  for (const [index, source] of sources.entries()) {
    if (source === 'node' && finality === 'final') {
      // A height recorded as skipped while the request waited is still an
      // answer, even after the tip wait ran out.
      if (state.localIndexer?.isSkippedHeight?.(height)) {
        return { bytes: Buffer.from('null'), source: 'node' };
      }
      if (skipNode) {
        // The tip wait ran out: still a miss, never an upstream failure, so a
        // node-only proxy answers "not yet" rather than a 5xx.
        errors.push({
          error: `block ${height} is not published by node yet`,
          notFound: true,
          source: 'node',
        });
        continue;
      }
      const published = state.localIndexer?.status?.published ?? 0;
      const inSync = state.localIndexer?.isInSync?.() ?? true;
      // Published blocks are immutable and stay valid while the node lags, but
      // an out-of-sync node will not produce new ones: go to the next source.
      const local =
        inSync || height <= published
          ? await state.localIndexer?.waitForBlock(height)
          : null;
      if (local) {
        try {
          validateBlockBytes(height, local.bytes, 'node');
          return local;
        } catch (error) {
          errors.push({ error: String(error), source: 'node' });
        }
      }
      const finalized = state.localIndexer?.currentFinalizedHeight?.() ?? null;
      if (
        inSync &&
        finalized !== null &&
        height > published &&
        // Only the next few heights: during catch-up, waiting on the node for
        // each block it has not reached would stall indexers per block.
        height <= Math.min(finalized, published) + MAX_NODE_TIP_WAIT_AHEAD
      ) {
        errors.push({
          error: `block ${height} is not published by node yet`,
          notFound: true,
          pending: true,
          source: 'node',
        });
        break;
      }
      errors.push({
        error: `block ${height} is unavailable from node`,
        notFound: height > published,
        notHeld: height <= published,
        source: 'node',
      });
      continue;
    }

    if (source === 'proxy') {
      const upstreamStart = Date.now();
      try {
        const bytes = await state.blockProxy.fetch(height, finality);
        validateBlockBytes(height, bytes, 'proxy');
        recordUpstreamOk(state, 'proxy', Date.now() - upstreamStart);
        // A wrong "skipped" answer would make indexers drop a real block, and
        // nothing downstream can tell. Skipped heights are rare, so confirm
        // a null with a later source when there is one.
        if (
          isJsonNull(bytes) &&
          sources.slice(index + 1).some((next) => next !== 'node')
        ) {
          proxyNull = bytes;
          continue;
        }
        logger.info(
          { height, latency_ms: Date.now() - start, source: 'proxy' },
          'block served',
        );
        if (
          finality === 'final' &&
          state.config.cacheEnabled &&
          !isJsonNull(bytes)
        ) {
          metrics.cacheWrites.inc();
          state.stats.cacheWrites++;
          state.cache.writeBackground(height, bytes);
        }
        return { bytes, source: 'proxy' };
      } catch (err) {
        // The upstream proxy only holds recent blocks and redirects older
        // ones: try the later sources first, pass the redirect on otherwise.
        if (err instanceof UpstreamRedirectError) {
          recordUpstreamRedirect(state, 'proxy', Date.now() - upstreamStart);
          redirect = err;
          continue;
        }
        const error = toUpstreamError(err, 'proxy');
        recordUpstreamFailure(
          state,
          'proxy',
          Date.now() - upstreamStart,
          !!error.notFound,
        );
        errors.push(error);
      }
      continue;
    }

    if (source === 'neardata') {
      const upstreamStart = Date.now();
      try {
        const bytes = await state.neardata.fetch(height, finality);
        validateBlockBytes(height, bytes, 'neardata');
        recordUpstreamOk(state, 'neardata', Date.now() - upstreamStart);
        if (proxyNull && !isJsonNull(bytes)) {
          metrics.proxyNullOverridden.inc();
          state.stats.proxyNullOverridden++;
          logger.error(
            { height },
            'proxy reported a real block as skipped; serving neardata',
          );
        }
        logger.info(
          { height, latency_ms: Date.now() - start, source: 'neardata' },
          'block served',
        );
        if (
          finality === 'final' &&
          state.config.cacheEnabled &&
          !isJsonNull(bytes)
        ) {
          metrics.cacheWrites.inc();
          state.stats.cacheWrites++;
          state.cache.writeBackground(height, bytes);
        }
        return { bytes, source: 'neardata' };
      } catch (err) {
        const notFound = !!(err as Error & { notFound?: boolean }).notFound;
        recordUpstreamFailure(
          state,
          'neardata',
          Date.now() - upstreamStart,
          notFound,
        );
        logger[notFound ? 'info' : 'warn'](
          { error: String(err), height, source: 'neardata' },
          notFound
            ? 'block unavailable from upstream'
            : 'upstream fetch failed',
        );
        errors.push(toUpstreamError(err, 'neardata'));
      }
    }
  }

  if (proxyNull) {
    logger.warn(
      { errors, height },
      'serving unconfirmed skipped height from proxy; later sources failed',
    );
    return { bytes: proxyNull, source: 'proxy' };
  }
  if (redirect) throw redirect;

  // All sources exhausted
  const allNotFound =
    errors.length > 0 && errors.every((error) => error.notFound);
  if (!errors.some((error) => error.pending)) {
    logger[allNotFound ? 'info' : 'error'](
      { errors, height },
      allNotFound
        ? 'block not found on upstreams'
        : 'all upstream sources failed',
    );
  }
  const err = new Error('all upstream sources failed') as Error & {
    errors: UpstreamError[];
    height: number;
  };
  err.errors = errors;
  err.height = height;
  throw err;
}

/**
 * Maximum number of concurrent in-flight dedup entries. Prevents memory
 * exhaustion under sustained attack with many distinct block heights.
 */
const MAX_DEDUP_SIZE = 10_000;

/**
 * Fetch a block with singleflight deduplication.
 *
 * Concurrent requests for the same height are collapsed: only one upstream
 * fetch is issued, and all waiters receive the same result.
 */
export async function fetchBlockDeduped(
  state: AppState,
  height: number,
  finality: 'final' | 'optimistic' = 'final',
  skipNode = false,
): Promise<{ bytes: Buffer; source: string }> {
  const key = `block:${finality}:${height}${skipNode ? ':remote' : ''}`;
  const ttlMs = state.config.dedupTtlMs;

  metrics.dedupRequests.inc();
  state.stats.dedupTotal++;

  const existing = state.dedup.get(key);
  if (existing) return existing;

  metrics.dedupLeaders.inc();
  state.stats.dedupLeaders++;

  // A leader that never settles once pinned its height for the life of the
  // process, and every later request attached to it instead of retrying. The
  // deadline guarantees the entry is always released.
  const fetch = new Promise<{ bytes: Buffer; source: string }>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        const err = new Error(
          `dedup deadline exceeded for ${finality} block ${height} after ${ttlMs}ms`,
        ) as Error & { errors: UpstreamError[] };

        // Without this the 502 logs as 'all upstreams exhausted' with no errors.
        err.errors = [{ error: 'dedup deadline exceeded', source: 'dedup' }];

        // Reject first, then guard the side effects: a throw here escapes the
        // timer callback as an uncaught exception, and index.ts exits on those.
        reject(err);

        try {
          metrics.dedupDeadlines.inc();
          state.stats.dedupDeadlines++;
          logger.error({ height, ttl_ms: ttlMs }, 'dedup deadline exceeded');
        } catch {
          // Telemetry must never take the process down.
        }
      }, ttlMs);

      fetchBlock(state, height, finality, skipNode).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
          // Only the leader of a fresh fetch compares, once per height.
          if (finality === 'final')
            state.shadow?.compare(
              height,
              value.bytes,
              value.source,
              state.tipHeight,
            );
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        },
      );
    },
  );

  // At capacity, skip the map to prevent memory exhaustion. Such a leader must
  // not carry the cleanup: it does not own the key, and would evict whichever
  // leader is stored under it later. The deadline still applies either way.
  if (state.dedup.size >= MAX_DEDUP_SIZE) return fetch;

  const promise = fetch.finally(() => state.dedup.delete(key));
  state.dedup.set(key, promise);

  return promise;
}
