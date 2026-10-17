import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppState } from '#state';
import { StatsCollector } from '#stats';

import { fetchBlockDeduped } from './index.js';

const HEIGHT = 212615360;
const BYTES = Buffer.from(
  JSON.stringify({
    block: { header: { hash: 'block-hash', height: HEIGHT } },
    shards: [],
  }),
);
const KEY = `block:final:${HEIGHT}`;

const makeState = (
  fetchImpl: () => Promise<Buffer>,
  dedupTtlMs = 50,
): AppState =>
  ({
    blockProxy: { fetch: fetchImpl } as never,
    cache: {} as never,
    config: {
      blockSources: ['node', 'neardata'],
      cacheEnabled: false,
      dedupTtlMs,
    } as never,
    dedup: new Map(),
    localIndexer: null,
    neardata: { fetch: fetchImpl } as never,
    neardataEnabled: true,
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

  it('deduplicates indexers ahead of local publication without advancing the follower', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    const status = { head: HEIGHT - 1, pending: 10, published: HEIGHT - 2 };
    const join = vi.fn().mockResolvedValue(null);
    state.localIndexer = { status, waitForBlock: join } as never;
    const results = await Promise.all([
      fetchBlockDeduped(state, HEIGHT),
      fetchBlockDeduped(state, HEIGHT),
    ]);
    expect(results.map((r) => r.source)).toEqual(['neardata', 'neardata']);
    expect(remote).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenCalledTimes(1);
    expect(status).toEqual({
      head: HEIGHT - 1,
      pending: 10,
      published: HEIGHT - 2,
    });
  });

  it('releases future-block misses so indexers can retry once the block exists', async () => {
    const missing = Object.assign(new Error('block not available yet'), {
      notFound: true,
    });
    const remote = vi
      .fn()
      .mockRejectedValueOnce(missing)
      .mockResolvedValueOnce(BYTES);
    const state = makeState(remote);
    state.localIndexer = {
      waitForBlock: vi.fn().mockResolvedValue(null),
    } as never;
    const results = await Promise.allSettled([
      fetchBlockDeduped(state, HEIGHT),
      fetchBlockDeduped(state, HEIGHT),
    ]);
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(remote).toHaveBeenCalledTimes(1);
    expect(state.dedup.size).toBe(0);
    expect((await fetchBlockDeduped(state, HEIGHT)).source).toBe('neardata');
    expect(remote).toHaveBeenCalledTimes(2);
  });

  it('does not count an expected future-height miss as an upstream error', async () => {
    const missing = Object.assign(new Error('block not available yet'), {
      notFound: true,
    });
    const state = makeState(vi.fn().mockRejectedValue(missing));
    state.localIndexer = {
      waitForBlock: vi.fn().mockResolvedValue(null),
    } as never;

    const error = await fetchBlockDeduped(state, HEIGHT).catch(
      (value) => value,
    );
    expect(error.errors).toContainEqual(
      expect.objectContaining({ notFound: true, source: 'neardata' }),
    );

    expect(state.stats.upstreamRequestsNeardata).toBe(1);
    expect(state.stats.upstreamErrorsNeardata).toBe(0);
  });

  it('joins active local production through the existing request dedup map', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    const join = vi.fn().mockResolvedValue({ bytes: BYTES, source: 'node' });
    state.localIndexer = { waitForBlock: join } as never;
    const results = await Promise.all([
      fetchBlockDeduped(state, HEIGHT),
      fetchBlockDeduped(state, HEIGHT),
    ]);
    expect(results.map((r) => r.source)).toEqual(['node', 'node']);
    expect(join).toHaveBeenCalledTimes(1);
    expect(remote).not.toHaveBeenCalled();
  });

  it('uses configured priority when choosing a block source', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    state.config = { ...state.config, blockSources: ['neardata', 'node'] };
    const join = vi.fn().mockResolvedValue({ bytes: BYTES, source: 'node' });
    state.localIndexer = { waitForBlock: join } as never;

    expect((await fetchBlockDeduped(state, HEIGHT)).source).toBe('neardata');
    expect(remote).toHaveBeenCalledOnce();
    expect(join).not.toHaveBeenCalled();
  });

  it('returns a recorded skipped height as JSON null for node-only operation', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    state.config = { ...state.config, blockSources: ['node'] };
    state.localIndexer = {
      isSkippedHeight: vi.fn().mockReturnValue(true),
      waitForBlock: vi.fn(),
    } as never;

    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.bytes.toString()).toBe('null');
    expect(result.source).toBe('node');
    expect(remote).not.toHaveBeenCalled();
  });

  it('falls back through the existing remote fetch when local production is unavailable', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    state.localIndexer = {
      waitForBlock: vi.fn().mockResolvedValue(null),
    } as never;
    expect((await fetchBlockDeduped(state, HEIGHT)).source).toBe('neardata');
    expect(remote).toHaveBeenCalledTimes(1);
  });

  it('serves an existing cache file without joining production or fetching remotely', async () => {
    const remote = vi.fn().mockResolvedValue(BYTES);
    const state = makeState(remote);
    state.config = { ...state.config, cacheEnabled: true };
    state.cache = { read: vi.fn().mockResolvedValue(BYTES) } as never;
    const join = vi.fn();
    state.localIndexer = { waitForBlock: join } as never;
    expect((await fetchBlockDeduped(state, HEIGHT)).source).toBe('cache');
    expect(join).not.toHaveBeenCalled();
    expect(remote).not.toHaveBeenCalled();
  });

  it('passes through skipped-height null without trying to cache it', async () => {
    const remote = vi.fn().mockResolvedValue(Buffer.from('null'));
    const state = makeState(remote);
    const writeBackground = vi.fn();
    state.config = { ...state.config, cacheEnabled: true };
    state.cache = {
      read: vi.fn().mockResolvedValue(null),
      writeBackground,
    } as never;

    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.bytes.toString()).toBe('null');
    expect(result.source).toBe('neardata');
    expect(writeBackground).not.toHaveBeenCalled();
  });

  describe('with an out-of-sync node', () => {
    const outOfSync = (state: AppState, published: number) => {
      const waitForBlock = vi.fn().mockResolvedValue(null);
      state.localIndexer = {
        currentFinalizedHeight: vi.fn().mockReturnValue(published + 1),
        isInSync: vi.fn().mockReturnValue(false),
        isSkippedHeight: vi.fn().mockReturnValue(false),
        status: { published },
        waitForBlock,
      } as never;
      return waitForBlock;
    };

    it('does not wait for unpublished heights and uses the next source', async () => {
      const remote = vi.fn().mockResolvedValue(BYTES);
      const state = makeState(remote);
      const waitForBlock = outOfSync(state, HEIGHT - 1);
      const result = await fetchBlockDeduped(state, HEIGHT);
      expect(result.source).toBe('neardata');
      expect(waitForBlock).not.toHaveBeenCalled();
    });

    it('does not report a pending node block when no other source has it', async () => {
      const missing = Object.assign(new Error('not yet'), { notFound: true });
      const state = makeState(vi.fn().mockRejectedValue(missing));
      state.config.blockSources = ['node'];
      outOfSync(state, HEIGHT - 1);
      const error = await fetchBlockDeduped(state, HEIGHT).catch(
        (value) => value,
      );
      expect(error.errors).toEqual([
        expect.objectContaining({ notFound: true, source: 'node' }),
      ]);
      expect(
        error.errors.some((item: { pending?: boolean }) => item.pending),
      ).toBe(false);
    });

    it('still serves a published block from the node', async () => {
      const remote = vi.fn().mockResolvedValue(BYTES);
      const state = makeState(remote);
      const waitForBlock = outOfSync(state, HEIGHT);
      waitForBlock.mockResolvedValue({ bytes: BYTES, source: 'node' });
      const result = await fetchBlockDeduped(state, HEIGHT);
      expect(result.source).toBe('node');
      expect(remote).not.toHaveBeenCalled();
    });

    it('still serves a cached block', async () => {
      const remote = vi.fn();
      const state = makeState(remote);
      state.config.cacheEnabled = true;
      state.cache = { read: vi.fn().mockResolvedValue(BYTES) } as never;
      const waitForBlock = outOfSync(state, HEIGHT);
      const result = await fetchBlockDeduped(state, HEIGHT);
      expect(result.source).toBe('cache');
      expect(waitForBlock).not.toHaveBeenCalled();
      expect(remote).not.toHaveBeenCalled();
    });
  });

  it('collapses concurrent requests for the same height into one fetch', async () => {
    const fetch = vi.fn().mockResolvedValue(BYTES);
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
    const state = makeState(() => Promise.resolve(BYTES));

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
      .mockResolvedValue(BYTES);
    const state = makeState(fetch, 30);

    await expect(fetchBlockDeduped(state, HEIGHT)).rejects.toThrow();
    const result = await fetchBlockDeduped(state, HEIGHT);

    expect(result.source).toBe('neardata');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // A leader created while the map is full is never stored, so it must not
  // carry the cleanup: it does not own the key and would evict whichever
  // leader is stored under it later.
  it('an uncached leader does not evict a later stored leader', async () => {
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

    const uncachedLeader = fetchBlockDeduped(state, HEIGHT);
    expect(state.dedup.has(KEY)).toBe(false);

    state.dedup.clear();
    const stored = fetchBlockDeduped(state, HEIGHT);
    stored.catch(() => {});
    expect(state.dedup.has(KEY)).toBe(true);

    // The uncached leader settles last and must not remove the stored entry.
    await uncachedLeader;
    await new Promise((resolve) => setImmediate(resolve));

    expect(state.dedup.has(KEY)).toBe(true);
  });

  it('stops storing entries at capacity', async () => {
    const state = makeState(() => Promise.resolve(BYTES));

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
