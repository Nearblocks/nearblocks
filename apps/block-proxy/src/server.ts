import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from 'nb-logger';

import * as metrics from '#metrics';
import type { AppState } from '#state';
import type { UpstreamError } from '#types';
import { fetchBlockDeduped } from '#upstream/index';

export function createDataServer(state: AppState): express.Express {
  const app = express();

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('x-content-type-options', 'nosniff');
    next();
  });

  // X-Request-Id middleware
  app.use((_req, res, next) => {
    const incomingRequestId = _req.headers['x-request-id'];
    const requestId =
      (Array.isArray(incomingRequestId)
        ? incomingRequestId[0]
        : incomingRequestId) || uuidv4();
    res.setHeader('x-request-id', String(requestId));
    next();
  });

  // GET /v0/block/:height
  app.get('/v0/block/:height', async (req, res) => {
    const heightStr = req.params.height;
    if (!/^\d+$/.test(heightStr)) {
      res
        .status(400)
        .json({ error: 'block height must be a non-negative integer' });
      return;
    }

    const height = Number(heightStr);

    if (!Number.isSafeInteger(height)) {
      res
        .status(400)
        .json({ error: 'block height exceeds safe integer range' });
      return;
    }

    metrics.requests.inc({ endpoint: 'block' });
    state.stats.requestsBlock++;

    try {
      const { bytes, source } = await fetchBlockDeduped(state, height);

      if (height > state.tipHeight) {
        state.tipHeight = height;
        metrics.tipHeight.set(height);
      }

      res
        .status(200)
        .set('content-type', 'application/json')
        .set('x-upstream-source', source)
        .send(bytes);
    } catch (err: unknown) {
      const upstreamErr = err as Error & {
        errors?: UpstreamError[];
        height?: number;
      };
      const errors = upstreamErr.errors || [];

      const upstreamErrors = errors.filter((e) => e.source !== 'cache');
      const allNotFound =
        upstreamErrors.length > 0 && upstreamErrors.every((e) => e.notFound);

      // Log full details server-side, return sanitized response to client
      if (allNotFound) {
        logger.warn({ errors, height }, 'block not found on any upstream');
        res.status(404).json({
          error: 'block not found',
          height,
        });
        return;
      }

      logger.error(
        { errors, height },
        'block request failed: all upstreams exhausted',
      );
      res.status(502).json({
        error: 'all upstream sources failed',
        height,
      });
    }
  });

  // GET /v0/last_block/final (cached for 1 second to collapse concurrent requests)
  let lastBlockCache: { bytes: Buffer; ts: number } | null = null;
  const LAST_BLOCK_CACHE_MS = 1000;

  app.get('/v0/last_block/final', async (_req, res) => {
    metrics.requests.inc({ endpoint: 'last_block' });
    state.stats.requestsLastBlock++;

    // Serve from short-lived cache
    if (lastBlockCache && Date.now() - lastBlockCache.ts < LAST_BLOCK_CACHE_MS) {
      res
        .status(200)
        .set('content-type', 'application/json')
        .set('x-upstream-source', 'cache')
        .send(lastBlockCache.bytes);
      return;
    }

    try {
      const bytes = await state.fastnear.fetchLastBlockFinal();

      // Update tip height from response
      try {
        const value = JSON.parse(bytes.toString('utf8'));
        const tip = value?.block_height ?? value?.block?.header?.height;
        if (typeof tip === 'number' && tip > 0) {
          state.tipHeight = tip;
          metrics.tipHeight.set(tip);
          logger.debug(
            { height: tip },
            'tip_height updated from last_block/final',
          );
        }
      } catch {
        // parsing failure is non-fatal
      }

      lastBlockCache = { bytes, ts: Date.now() };

      res
        .status(200)
        .set('content-type', 'application/json')
        .set('x-upstream-source', 'fastnear')
        .send(bytes);
    } catch (err) {
      logger.error(
        { error: String(err) },
        'last_block/final fetch from fastnear failed',
      );
      res
        .status(502)
        .json({ error: 'upstream fetch failed for last_block/final' });
    }
  });

  // GET /healthz
  app.get('/healthz', (_req, res) => {
    res.json({
      status: 'ok',
      uptime_secs: Math.floor((Date.now() - state.startTime) / 1000),
      version: state.version,
    });
  });

  // GET /readyz
  app.get('/readyz', (_req, res) => {
    if (state.ready) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'starting' });
    }
  });

  return app;
}
