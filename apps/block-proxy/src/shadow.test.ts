import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { diffBlocks, ShadowComparator } from '#shadow';
import { UpstreamRedirectError } from '#types';

const HEIGHT = 1000;
const block = (extra: Record<string, unknown> = {}) =>
  Buffer.from(
    JSON.stringify({
      block: { header: { hash: 'h', height: HEIGHT } },
      shards: [{ shard_id: 0, ...extra }],
    }),
  );
const notFound = Object.assign(new Error('not found'), { notFound: true });

describe('diffBlocks', () => {
  it('ignores object key order', () => {
    expect(
      diffBlocks(
        Buffer.from('{"a":1,"b":[1,2]}'),
        Buffer.from('{"b":[1,2],"a":1}'),
      ),
    ).toEqual([]);
  });

  it('compares large integers exactly', () => {
    const diffs = diffBlocks(
      Buffer.from('{"t":1730000000000000001}'),
      Buffer.from('{"t":1730000000000000002}'),
    );
    expect(diffs).toEqual([
      {
        path: '$.t',
        served: '1730000000000000001',
        shadow: '1730000000000000002',
      },
    ]);
  });

  it('reports missing keys, type changes and array lengths', () => {
    const diffs = diffBlocks(
      Buffer.from('{"a":null,"b":[1,2],"c":"x"}'),
      Buffer.from('{"a":0,"b":[1],"d":"x"}'),
    );
    expect(diffs.map((diff) => diff.path)).toEqual([
      '$.a',
      '$.b.length',
      '$.c',
      '$.d',
    ]);
    expect(diffs[2]).toMatchObject({ served: '"x"', shadow: '<missing>' });
  });

  it('treats a different number spelling as a difference', () => {
    expect(diffBlocks(Buffer.from('[1.0]'), Buffer.from('[1]'))).toHaveLength(
      1,
    );
  });
});

describe('ShadowComparator', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const make = (
    fetch: ReturnType<typeof vi.fn>,
    sampleRate = 1,
    upstreamSource: null | string = 'node',
  ) =>
    new ShadowComparator(
      'proxy',
      sampleRate,
      {
        fetchWithSource: async (height: number) => ({
          bytes: await fetch(height),
          source: upstreamSource,
        }),
      } as never,
      () => 0.5,
    );
  const settle = async () => {
    for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(1000);
  };

  it('counts a match and a mismatch', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(block())
      .mockResolvedValueOnce(block({ chunk: null }));
    const shadow = make(fetch);
    shadow.compare(HEIGHT, block(), 'neardata', HEIGHT);
    await settle();
    shadow.compare(HEIGHT + 1, block(), 'neardata', HEIGHT);
    await settle();
    expect(shadow.counts).toMatchObject({ match: 1, mismatch: 1 });
    expect(shadow.lastMismatchHeight).toBe(HEIGHT + 1);
  });

  it('waits for a shadow that trails the tip, then gives up as unavailable', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(notFound)
      .mockResolvedValueOnce(block());
    const shadow = make(fetch);
    shadow.compare(HEIGHT, block(), 'neardata', HEIGHT);
    await settle();
    expect(shadow.counts.match).toBe(1);

    const missing = vi.fn().mockRejectedValue(notFound);
    const never = make(missing);
    never.compare(HEIGHT, block(), 'neardata', HEIGHT);
    await settle();
    expect(never.counts.unavailable).toBe(1);
    expect(missing).toHaveBeenCalledTimes(4);
  });

  it('separates failures from misses and redirects', async () => {
    const shadow = make(
      vi
        .fn()
        .mockRejectedValueOnce(new Error('connect timeout'))
        .mockRejectedValueOnce(new UpstreamRedirectError('https://archive/1')),
    );
    shadow.compare(HEIGHT, block(), 'neardata', HEIGHT);
    shadow.compare(HEIGHT + 1, block(), 'neardata', HEIGHT);
    await settle();
    expect(shadow.counts).toMatchObject({ error: 1, unavailable: 1 });
  });

  it('does not count a block the node proxy did not build as a match', async () => {
    for (const source of ['neardata', 'cache', null]) {
      const shadow = make(vi.fn().mockResolvedValue(block()), 1, source);
      shadow.compare(HEIGHT, block(), 'neardata', HEIGHT);
      await settle();
      expect(shadow.counts).toMatchObject({ match: 0, unavailable: 1 });
    }
  });

  it('skips blocks it cannot learn from', async () => {
    const fetch = vi.fn().mockResolvedValue(block());
    const shadow = make(fetch);
    shadow.compare(HEIGHT, block(), 'proxy', HEIGHT);
    shadow.compare(HEIGHT, block(), 'cache', HEIGHT);
    shadow.compare(HEIGHT - 101, block(), 'neardata', HEIGHT);
    make(fetch, 0.25).compare(HEIGHT, block(), 'neardata', HEIGHT);
    await settle();
    expect(shadow.counts.skipped).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('never throws into the caller', () => {
    const shadow = new ShadowComparator('proxy', 1, {} as never, () => {
      throw new Error('boom');
    });
    expect(() =>
      shadow.compare(HEIGHT, block(), 'neardata', HEIGHT),
    ).not.toThrow();
  });

  it('bounds concurrent comparisons', async () => {
    const fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    const shadow = make(fetch);
    for (let i = 0; i < 10; i++)
      shadow.compare(HEIGHT + i, block(), 'neardata', HEIGHT);
    expect(fetch).toHaveBeenCalledTimes(8);
    expect(shadow.counts.skipped).toBe(2);
  });
});
