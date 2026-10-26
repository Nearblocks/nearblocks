import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('#config', () => ({
  default: { fastnearApiKey: '', fastnearUrl: 'https://fastnear.example' },
}));

vi.mock('#libs/logger', () => ({ default: { warn: vi.fn() } }));

vi.mock('#libs/redis', () => ({
  default: {
    client: () => ({
      del: async (key: string) => (store.delete(key) ? 1 : 0),
      set: async (key: string, value: string) => {
        if (store.has(key)) return null;
        store.set(key, value);
        return 'OK';
      },
    }),
    get: async (key: string) => store.get(key) ?? null,
    prefixedKeys: (key: string) => key,
    set: async (key: string, value: string) => {
      store.set(key, value);
    },
    stringify: async (key: string, value: unknown) => {
      store.set(key, JSON.stringify(value));
    },
  },
}));

const { getAccountFtBalances } = await import('./fastnear.js');
const { fastnearFtLookups, fastnearRequests } =
  await import('./promMetrics.js');

type Metric = {
  get: () => Promise<{ values: { labels: object; value: number }[] }>;
};

const values = async (metric: Metric) =>
  Object.fromEntries(
    (await metric.get()).values.map((v) => [
      Object.values(v.labels)[0],
      v.value,
    ]),
  );

const respond = (status: number, body: unknown = {}) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('getAccountFtBalances metrics', () => {
  beforeEach(() => {
    store.clear();
    fastnearFtLookups.reset();
    fastnearRequests.reset();
  });
  afterEach(() => vi.restoreAllMocks());

  it('counts a fetch, then a cache hit for the same account', async () => {
    const fetch = respond(200, {
      tokens: [{ balance: '5', contract_id: 'usdt.near' }],
    });

    await getAccountFtBalances('alice.near');
    await getAccountFtBalances('alice.near');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await values(fastnearFtLookups)).toEqual({
      cache_hit: 1,
      fetched: 1,
    });
    expect(await values(fastnearRequests)).toEqual({ '200': 1 });
  });

  it('counts a 429 and skips FastNear while cooling down', async () => {
    const fetch = respond(429);

    await getAccountFtBalances('bob.near');
    store.delete('fastnear:ft:v2:carol.near');
    await getAccountFtBalances('carol.near');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await values(fastnearRequests)).toEqual({ '429': 1 });
    expect(await values(fastnearFtLookups)).toEqual({
      cooldown: 1,
      fetched: 1,
    });
  });

  it('counts timeouts separately from other errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      Object.assign(new Error('timed out'), { name: 'TimeoutError' }),
    );

    await getAccountFtBalances('dave.near');

    expect(await values(fastnearRequests)).toEqual({ timeout: 1 });
  });
});
