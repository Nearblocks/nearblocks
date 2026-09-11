import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppState } from '#state';
import { StatsCollector } from '#stats';
import type { FastnearUpstream } from '#upstream/fastnear';
import { UpstreamPool } from '#upstream/pool';

import { fetchBlockDeduped } from './index.js';

const HEIGHT = 212615360;
const BYTES = Buffer.from('{}');
const KEY = `block:${HEIGHT}`;
const BASE_MS = 60_000;
const MAX_MS = 900_000;

type Fetcher = (height: number) => Promise<Buffer>;

/** Priority order is list order, so callers pass an ordered list of pairs. */
const poolOf = (upstreams: [string, Fetcher][]) =>
  new UpstreamPool(
    upstreams.map(([name, fetch]) => ({
      name,
      upstream: { fetch } as unknown as FastnearUpstream,
    })),
    BASE_MS,
    MAX_MS,
  );

const stateWithPool = (pool: UpstreamPool, dedupTtlMs = 50): AppState =>
  ({
    cache: {} as never,
    config: { cacheEnabled: false, dedupTtlMs } as never,
    dedup: new Map(),
    fastnearEnabled: true,
    pool,
    ready: true,
    s3: null,
    s3Enabled: false,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: 'test',
  }) as AppState;

const makeState = (fetchImpl: Fetcher, dedupTtlMs = 50): AppState =>
  stateWithPool(poolOf([['fastnear', fetchImpl]]), dedupTtlMs);

const httpError = (status: number, extra: Record<string, unknown> = {}) =>
  Object.assign(new Error(`status ${status}`), { status, ...extra });

const notFound = () => httpError(404, { notFound: true });

describe('fetchBlockDeduped', () => {
  beforeEach(() => vi.useRealTimers());

  it('collapses concurrent requests for the same height into one fetch', async () => {
    const fetch = vi.fn().mockResolvedValue(Buffer.from('{}'));
    const state = makeState(fetch);

    await Promise.all([
      fetchBlockDeduped(state, HEIGHT),
      fetchBlockDeduped(state, HEIGHT),
      fetchBlockDeduped(state, HEIGHT),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(state.stats.dedupLeaders).toBe(1);
  });

  it('releases the entry after a successful fetch', async () => {
    const state = makeState(() => Promise.resolve(Buffer.from('{}')));

    await fetchBlockDeduped(state, HEIGHT);

    expect(state.dedup.size).toBe(0);
  });

  it('releases the entry after a failed fetch', async () => {
    const state = makeState(() => Promise.reject(new Error('upstream down')));

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toThrow();

    expect(state.dedup.size).toBe(0);
  });

  // The incident: a leader that never settles pinned one height for 3h43m and
  // every later request attached to it instead of retrying upstream.
  it('releases the entry when the fetch never settles', async () => {
    const state = makeState(() => new Promise<Buffer>(() => {}), 30);

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toThrow(
      /dedup deadline exceeded/,
    );

    expect(state.dedup.size).toBe(0);
    expect(state.stats.dedupDeadlines).toBe(1);
  });

  it('lets the next request reach upstream after a stranded leader', async () => {
    const fetch = vi
      .fn()
      .mockImplementationOnce(() => new Promise<Buffer>(() => {}))
      .mockResolvedValue(Buffer.from('{"ok":true}'));
    const state = makeState(fetch, 30);

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toThrow();
    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.source).toBe('fastnear');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // A leader created while the map is full is never stored, so it must not
  // carry the cleanup: it does not own the key and would evict whichever
  // leader is stored under it later.
  it('a capacity-bypassed leader does not evict a later leader', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(BYTES)
      .mockImplementation(() => new Promise<Buffer>(() => {}));
    const state = makeState(fetch, 10_000);

    for (let i = 0; i < 10_000; i++) {
      state.dedup.set(
        `block:${i}`,
        Promise.resolve({ bytes: BYTES, source: 'x' }),
      );
    }

    const bypassed = fetchBlockDeduped(state, HEIGHT);
    expect(state.dedup.has(KEY)).toBe(false);

    state.dedup.clear();
    const stored = fetchBlockDeduped(state, HEIGHT);
    stored.catch(() => {});
    expect(state.dedup.has(KEY)).toBe(true);

    // The bypassed leader settles last. It must not take the stored one with it.
    await bypassed;
    await new Promise((resolve) => setImmediate(resolve));

    expect(state.dedup.has(KEY)).toBe(true);
  });

  it('stops storing entries at capacity', async () => {
    const state = makeState(() => Promise.resolve(Buffer.from('{}')));

    for (let i = 0; i < 10_000; i++) {
      state.dedup.set(
        `block:${i}`,
        Promise.resolve({ bytes: BYTES, source: 'x' }),
      );
    }

    await fetchBlockDeduped(state, HEIGHT);

    expect(state.dedup.size).toBe(10_000);
  });

  // index.ts exits the process on an uncaught exception, and the deadline's
  // side effects run inside a timer callback.
  it('survives telemetry throwing when the deadline fires', async () => {
    const state = makeState(() => new Promise<Buffer>(() => {}), 30);
    Object.defineProperty(state.stats, 'dedupDeadlines', {
      get: () => 0,
      set: () => {
        throw new Error('metrics backend down');
      },
    });

    const uncaught = vi.fn();
    process.on('uncaughtException', uncaught);

    try {
      await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toThrow(
        /dedup deadline exceeded/,
      );
      await new Promise((resolve) => setImmediate(resolve));

      expect(uncaught).not.toHaveBeenCalled();
      expect(state.dedup.size).toBe(0);
    } finally {
      process.off('uncaughtException', uncaught);
    }
  });

  it('tags the deadline error so the 502 logs a cause', async () => {
    const state = makeState(() => new Promise<Buffer>(() => {}), 30);

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toMatchObject({
      errors: [{ source: 'dedup' }],
    });
  });
});

describe('fetchBlock upstream pool', () => {
  it('serves from the highest-priority endpoint and leaves the rest alone', async () => {
    const first = vi.fn().mockResolvedValue(BYTES);
    const second = vi.fn().mockResolvedValue(BYTES);
    const state = stateWithPool(
      poolOf([
        ['vm-a', first],
        ['fastnear', second],
      ]),
    );

    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.source).toBe('vm-a');
    expect(second).not.toHaveBeenCalled();
  });

  it('falls over to the next endpoint on a 429 and parks the offender', async () => {
    const limited = vi.fn().mockRejectedValue(httpError(429));
    const backstop = vi.fn().mockResolvedValue(BYTES);
    const pool = poolOf([
      ['vm-a', limited],
      ['fastnear', backstop],
    ]);
    const state = stateWithPool(pool);

    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.source).toBe('fastnear');
    expect(pool.cooldownState()).toContainEqual({
      cooling: true,
      name: 'vm-a',
    });

    // Parked, so the next request must not spend another call on it.
    await fetchBlockDeduped(state, HEIGHT);
    expect(limited).toHaveBeenCalledTimes(1);
  });

  // The whole point of the pool: a lagging peer must never end the search,
  // or an indexer would see a 404 for a block that does exist upstream.
  it('keeps trying later endpoints after a 404', async () => {
    const missing = vi.fn().mockRejectedValue(notFound());
    const has = vi.fn().mockResolvedValue(BYTES);
    const state = stateWithPool(
      poolOf([
        ['vm-a', missing],
        ['fastnear', has],
      ]),
    );

    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.source).toBe('fastnear');
    expect(missing).toHaveBeenCalledTimes(1);
  });

  it('does not park an endpoint that 404s', async () => {
    const missing = vi.fn().mockRejectedValue(notFound());
    const pool = poolOf([
      ['vm-a', missing],
      ['fastnear', () => Promise.resolve(BYTES)],
    ]);
    const state = stateWithPool(pool);

    await fetchBlockDeduped(state, HEIGHT);

    expect(pool.cooldownState()).toEqual([
      { cooling: false, name: 'vm-a' },
      { cooling: false, name: 'fastnear' },
    ]);
  });

  it('reports notFound only when every endpoint 404s', async () => {
    const state = stateWithPool(
      poolOf([
        ['vm-a', () => Promise.reject(notFound())],
        ['fastnear', () => Promise.reject(notFound())],
      ]),
    );

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toMatchObject({
      errors: [
        { notFound: true, source: 'vm-a' },
        { notFound: true, source: 'fastnear' },
      ],
    });
  });

  it('marks the result as not-all-notFound when one endpoint really failed', async () => {
    const state = stateWithPool(
      poolOf([
        ['vm-a', () => Promise.reject(httpError(500))],
        ['fastnear', () => Promise.reject(notFound())],
      ]),
    );

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toMatchObject({
      errors: [
        { notFound: false, source: 'vm-a' },
        { notFound: true, source: 'fastnear' },
      ],
    });
  });

  it('records per-endpoint stats', async () => {
    const state = stateWithPool(
      poolOf([
        ['vm-a', () => Promise.reject(httpError(429))],
        ['fastnear', () => Promise.resolve(BYTES)],
      ]),
    );

    await fetchBlockDeduped(state, HEIGHT);

    const snapshot = state.stats.snapshot(0, 0, ['vm-a', 'fastnear']);

    expect(snapshot.upstreams['vm-a']).toMatchObject({
      errors: 1,
      requests: 1,
    });
    expect(snapshot.upstreams.fastnear).toMatchObject({
      errors: 0,
      requests: 1,
    });
  });

  it('recovers an endpoint after its cooldown expires', async () => {
    const flaky = vi
      .fn()
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValue(BYTES);
    const pool = poolOf([
      ['vm-a', flaky],
      ['fastnear', () => Promise.resolve(BYTES)],
    ]);
    const state = stateWithPool(pool);

    await fetchBlockDeduped(state, HEIGHT);

    expect(pool.available().map((e) => e.name)).toEqual(['fastnear']);
    expect(pool.available(Date.now() + BASE_MS + 1).map((e) => e.name)).toEqual(
      ['vm-a', 'fastnear'],
    );
  });
});

describe('fetchBlock resting-upstream recovery', () => {
  // The regression this guards: available() hides resting endpoints, so a
  // single 404 from the one ready endpoint used to be reported as "not found
  // anywhere" — stalling the indexer on a block another endpoint had.
  it('wakes a resting endpoint rather than returning a false 404', async () => {
    const hasBlock = vi.fn().mockResolvedValue(BYTES);
    const pool = poolOf([
      ['vm-a', () => Promise.reject(notFound())],
      ['fastnear', hasBlock],
    ]);
    pool.penalise('fastnear', httpError(429));

    const state = stateWithPool(pool);
    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(hasBlock).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('fastnear');
  });

  it('still returns 404 when the woken endpoint also lacks the block', async () => {
    const pool = poolOf([
      ['vm-a', () => Promise.reject(notFound())],
      ['fastnear', () => Promise.reject(notFound())],
    ]);
    pool.penalise('fastnear', httpError(429));

    await expect(
      fetchBlockDeduped(stateWithPool(pool), HEIGHT),
    ).rejects.toMatchObject({
      errors: [
        { notFound: true, source: 'vm-a' },
        { notFound: true, source: 'fastnear' },
      ],
    });
  });

  // Only a would-be 404 wakes them; an ordinary failure must leave them rested.
  it('does not wake a resting endpoint for a non-404 failure', async () => {
    const rested = vi.fn().mockResolvedValue(BYTES);
    const pool = poolOf([
      ['vm-a', () => Promise.reject(httpError(500))],
      ['fastnear', rested],
    ]);
    pool.penalise('fastnear', httpError(429));

    await expect(
      fetchBlockDeduped(stateWithPool(pool), HEIGHT),
    ).rejects.toThrow();
    expect(rested).not.toHaveBeenCalled();
  });
});
