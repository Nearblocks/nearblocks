import { logger } from 'nb-logger';

import * as metrics from '#metrics';
import type { AppState } from '#state';
import type { UpstreamError } from '#types';

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
    case 'fastnear':
      state.stats.upstreamRequestsFastnear++;
      state.stats.upstreamDurationUsFastnear += durationUs;
      break;
    case 's3':
      state.stats.upstreamRequestsS3++;
      state.stats.upstreamDurationUsS3 += durationUs;
      break;
  }
}

function recordUpstreamErr(
  state: AppState,
  source: string,
  elapsedMs: number,
): void {
  const durationSecs = elapsedMs / 1000;
  const durationUs = elapsedMs * 1000;

  metrics.upstreamRequests.inc({ result: 'error', source });
  metrics.upstreamDuration.observe({ source }, durationSecs);

  switch (source) {
    case 'fastnear':
      state.stats.upstreamRequestsFastnear++;
      state.stats.upstreamErrorsFastnear++;
      state.stats.upstreamDurationUsFastnear += durationUs;
      break;
    case 's3':
      state.stats.upstreamRequestsS3++;
      state.stats.upstreamErrorsS3++;
      state.stats.upstreamDurationUsS3 += durationUs;
      break;
  }
}

export async function fetchBlock(
  state: AppState,
  height: number,
): Promise<{ bytes: Buffer; source: string }> {
  const errors: UpstreamError[] = [];
  const start = Date.now();

  // 1. Local filesystem cache
  if (state.config.cacheEnabled) {
    try {
      const cached = await state.cache.read(height);
      if (cached) {
        metrics.cacheHits.inc();
        state.stats.cacheHits++;
        logger.info(
          { height, latency_ms: Date.now() - start, source: 'cache' },
          'block served',
        );
        return { bytes: cached, source: 'cache' };
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

  // 2. S3/MinIO
  if (state.s3Enabled && state.s3) {
    const upstreamStart = Date.now();
    try {
      const bytes = await state.s3.fetch(height);
      recordUpstreamOk(state, 's3', Date.now() - upstreamStart);
      logger.info(
        { height, latency_ms: Date.now() - start, source: 's3' },
        'block served',
      );
      if (state.config.cacheEnabled) {
        metrics.cacheWrites.inc();
        state.stats.cacheWrites++;
        state.cache.writeBackground(height, bytes);
      }
      return { bytes, source: 's3' };
    } catch (err) {
      recordUpstreamErr(state, 's3', Date.now() - upstreamStart);
      logger.warn(
        { error: String(err), height, source: 's3' },
        'upstream fetch failed',
      );
      errors.push({
        error: String(err),
        notFound: !!(err as Error & { notFound?: boolean }).notFound,
        source: 's3',
      });
    }
  }

  // 3. fastnear
  if (state.fastnearEnabled) {
    const upstreamStart = Date.now();
    try {
      const bytes = await state.fastnear.fetch(height);
      recordUpstreamOk(state, 'fastnear', Date.now() - upstreamStart);
      logger.info(
        { height, latency_ms: Date.now() - start, source: 'fastnear' },
        'block served',
      );
      if (state.config.cacheEnabled) {
        metrics.cacheWrites.inc();
        state.stats.cacheWrites++;
        state.cache.writeBackground(height, bytes);
      }
      return { bytes, source: 'fastnear' };
    } catch (err) {
      recordUpstreamErr(state, 'fastnear', Date.now() - upstreamStart);
      logger.warn(
        { error: String(err), height, source: 'fastnear' },
        'upstream fetch failed',
      );
      errors.push({
        error: String(err),
        notFound: !!(err as Error & { notFound?: boolean }).notFound,
        source: 'fastnear',
      });
    }
  }

  // All sources exhausted
  logger.error({ errors, height }, 'all upstream sources failed');
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
): Promise<{ bytes: Buffer; source: string }> {
  const key = `block:${height}`;
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
          `dedup deadline exceeded for block ${height} after ${ttlMs}ms`,
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

      fetchBlock(state, height).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
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
