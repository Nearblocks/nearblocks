import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppState } from '#state';
import { StatsCollector } from '#stats';

import { fetchBlockDeduped } from './index.js';

const HEIGHT = 212615360;
const BYTES = Buffer.from('{}');
const KEY = `block:${HEIGHT}`;

const makeState = (
  fetchImpl: () => Promise<Buffer>,
  dedupTtlMs = 50,
): AppState =>
  ({
    cache: {} as never,
    config: { cacheEnabled: false, dedupTtlMs } as never,
    dedup: new Map(),
    fastnear: { fetch: fetchImpl } as never,
    fastnearEnabled: true,
    ready: true,
    s3: null,
    s3Enabled: false,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: 'test',
  }) as AppState;

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
