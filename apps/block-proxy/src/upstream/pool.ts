import { logger } from 'nb-logger';

import type { UpstreamConfig } from '#config';
import type { UpstreamFetchError } from '#types';
import { FastnearUpstream } from '#upstream/fastnear';

/**
 * Only an explicit rate-limit signal takes an endpoint out of rotation. A 404
 * describes the block rather than the endpoint, and a transport error is
 * usually transient.
 */
const COOLDOWN_STATUSES = new Set([429, 503]);

export interface PoolEntry {
  consecutiveLimits: number;
  cooldownUntil: number;
  /**
   * Bumped on every cooldown. A request that started before the current
   * cooldown must not clear it when it later succeeds.
   */
  generation: number;
  name: string;
  upstream: FastnearUpstream;
}

export const shouldCooldown = (err: unknown): boolean => {
  const status = (err as UpstreamFetchError)?.status;
  return typeof status === 'number' && COOLDOWN_STATUSES.has(status);
};

/**
 * An ordered set of neardata-compatible endpoints, tried in configured order.
 * An endpoint that reports a rate limit is rested before being tried again.
 */
export class UpstreamPool {
  private baseMs: number;
  private entries: PoolEntry[];
  private maxMs: number;

  constructor(
    upstreams: { name: string; upstream: FastnearUpstream }[],
    baseMs: number,
    maxMs: number,
  ) {
    this.baseMs = baseMs;
    this.maxMs = maxMs;
    this.entries = upstreams.map(({ name, upstream }) => ({
      consecutiveLimits: 0,
      cooldownUntil: 0,
      generation: 0,
      name,
      upstream,
    }));
  }

  static fromConfig(
    upstreams: UpstreamConfig[],
    timeoutMs: number,
    baseMs: number,
    maxMs: number,
  ): UpstreamPool {
    return new UpstreamPool(
      upstreams.map((upstream) => ({
        name: upstream.name,
        upstream: new FastnearUpstream(upstream, timeoutMs),
      })),
      baseMs,
      maxMs,
    );
  }

  /**
   * Endpoints to try first, in configured order. When every endpoint is
   * resting we still return one — the soonest to recover — because stalling
   * the indexers is worse than one more rate-limited request.
   */
  available(now = Date.now()): PoolEntry[] {
    if (this.entries.length === 0) return [];

    const ready = this.entries.filter((entry) => entry.cooldownUntil <= now);

    if (ready.length > 0) return ready;

    const soonest = this.entries.reduce((best, entry) =>
      entry.cooldownUntil < best.cooldownUntil ? entry : best,
    );

    logger.warn(
      { source: soonest.name },
      'every upstream is resting, using the soonest to recover',
    );

    return [soonest];
  }

  /** Gauge input: read at scrape time so an expired cooldown reports as 0. */
  cooldownState(now = Date.now()): { cooling: boolean; name: string }[] {
    return this.entries.map((entry) => ({
      cooling: entry.cooldownUntil > now,
      name: entry.name,
    }));
  }

  /** Generation of an entry, so a caller can detect a cooldown set meanwhile. */
  generationOf(name: string): number {
    return (
      this.entries.find((candidate) => candidate.name === name)?.generation ?? 0
    );
  }

  names(): string[] {
    return this.entries.map((entry) => entry.name);
  }

  /**
   * Rests a rate-limited endpoint. The delay doubles per consecutive limit —
   * base, 2x, 4x … capped at max. An upstream's own Retry-After is preferred,
   * but still clamped: it is remote input and must not be able to park an
   * endpoint indefinitely, nor to disable the backoff with a zero.
   */
  penalise(name: string, err: unknown, now = Date.now()): void {
    const entry = this.entries.find((candidate) => candidate.name === name);

    if (!entry) return;

    entry.consecutiveLimits += 1;
    entry.generation += 1;

    const backoffMs = Math.min(
      this.baseMs * 2 ** (entry.consecutiveLimits - 1),
      this.maxMs,
    );
    const retryAfterMs = (err as UpstreamFetchError)?.retryAfterMs;
    const cooldownMs = Math.min(
      Math.max(retryAfterMs ?? backoffMs, this.baseMs),
      this.maxMs,
    );

    entry.cooldownUntil = now + cooldownMs;

    logger.warn(
      {
        consecutive_limits: entry.consecutiveLimits,
        cooldown_ms: cooldownMs,
        from_retry_after: retryAfterMs !== undefined,
        source: name,
      },
      'upstream resting after rate limit',
    );
  }

  /**
   * A success clears the backoff. `generation` guards the race where a request
   * that started before a cooldown finishes after it and would otherwise wipe
   * it — concurrent height fetches make that ordering routine.
   */
  reset(name: string, generation?: number): void {
    const entry = this.entries.find((candidate) => candidate.name === name);

    if (
      !entry ||
      (entry.consecutiveLimits === 0 && entry.cooldownUntil === 0)
    ) {
      return;
    }

    if (generation !== undefined && generation !== entry.generation) return;

    entry.consecutiveLimits = 0;
    entry.cooldownUntil = 0;
  }

  /**
   * Endpoints skipped by `available()` because they are resting. A caller that
   * would otherwise report "not found" must try these before concluding: a
   * missing block has to be missing *everywhere*, not just everywhere we felt
   * like asking.
   */
  resting(now = Date.now()): PoolEntry[] {
    const ready = this.entries.filter((entry) => entry.cooldownUntil <= now);

    if (ready.length === 0) return [];

    return this.entries.filter((entry) => entry.cooldownUntil > now);
  }
}
