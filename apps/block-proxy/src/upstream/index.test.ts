import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppState } from '#state';
import { StatsCollector } from '#stats';

import { fetchBlockDeduped } from './index.js';

const HEIGHT = 212615360;
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
    lastRequestAt: Date.now(),
    lastServedAt: Date.now(),
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

  // A leader whose deadline timer fires late can settle after a reader has
  // already evicted it and installed a successor. Without the identity check
  // in the .finally, the old leader deletes the NEW entry and singleflight
  // collapses for that height — a thundering herd during slow-upstream
  // conditions, which is exactly when this race is reachable.
  it('a slow leader settling after eviction must not delete the new entry', async () => {
    let releaseFirst: (b: Buffer) => void = () => {};
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Buffer>((resolve) => {
            releaseFirst = resolve;
          }),
      )
      .mockImplementationOnce(() => new Promise<Buffer>(() => {}));
    const state = makeState(fetch, 10_000);

    const first = fetchBlockDeduped(state, HEIGHT);
    first.catch(() => {});

    // Backdate the in-flight leader past its TTL so the next read evicts it.
    const leader = state.dedup.get(KEY);
    state.dedup.set(KEY, { ...leader!, createdAt: Date.now() - 60_000 });

    const second = fetchBlockDeduped(state, HEIGHT);
    second.catch(() => {});
    const successor = state.dedup.get(KEY);
    expect(successor).not.toBe(leader);

    // The evicted leader now settles, late.
    releaseFirst(Buffer.from('{}'));
    await first.catch(() => {});
    await new Promise((resolve) => setImmediate(resolve));

    expect(state.dedup.get(KEY)).toBe(successor);
  });

  // Defence in depth: even if the deadline timer never fires, a reader must
  // never be handed an entry that has outlived its TTL.
  it('evicts a stale entry on read rather than serving it', async () => {
    const fetch = vi.fn().mockResolvedValue(Buffer.from('{}'));
    const state = makeState(fetch, 50);

    state.dedup.set(KEY, {
      createdAt: Date.now() - 10_000,
      promise: new Promise(() => {}),
    });

    await expect(fetchBlockDeduped(state, HEIGHT)).resolves.toMatchObject({
      source: 'fastnear',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
