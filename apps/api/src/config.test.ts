import { afterEach, describe, expect, it, vi } from 'vitest';

const REQUIRED = {
  API_ACCESS_KEY: 'key',
  DB_URL_BALANCE: 'postgres://db',
  DB_URL_BASE: 'postgres://db',
  DB_URL_CONTRACT: 'postgres://db',
  DB_URL_EVENTS: 'postgres://db',
  DB_URL_MULTICHAIN: 'postgres://db',
  DB_URL_STAKING: 'postgres://db',
  DB_URL_USER: 'postgres://db',
  DB_WRITE_URL_BASE: 'postgres://db',
  NETWORK: 'mainnet',
};

const loadConfig = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const name of [
    'FASTNEAR_API_KEY',
    'RPC_AUTH_TOKENS',
    'RPC_URL',
    'RPC_URLS',
  ])
    vi.stubEnv(name, '');
  for (const [name, value] of Object.entries({ ...REQUIRED, ...env }))
    vi.stubEnv(name, value);
  return (await import('#config')).default;
};

describe('RPC endpoints', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('takes a comma-separated RPC_URL in priority order', async () => {
    const config = await loadConfig({
      FASTNEAR_API_KEY: 'fast',
      RPC_AUTH_TOKENS: 'node-key,',
      RPC_URL: 'https://node.example/rpc, https://rpc.example',
    });
    expect(config.rpcUrls).toEqual([
      'https://node.example/rpc',
      'https://rpc.example',
    ]);
    expect(config.rpcAuthTokens).toEqual(['node-key', '']);
  });

  it('keeps the FastNear fallback for a single RPC_URL', async () => {
    expect(
      (await loadConfig({ FASTNEAR_API_KEY: 'fast', RPC_URL: 'https://a' }))
        .rpcUrls,
    ).toEqual(['https://a', 'https://archival-rpc.mainnet.fastnear.com']);
    expect((await loadConfig({ RPC_URL: 'https://a' })).rpcUrls).toEqual([
      'https://a',
    ]);
  });

  it('keeps RPC_URLS working, and winning over RPC_URL as before', async () => {
    expect(
      (await loadConfig({ FASTNEAR_API_KEY: 'fast', RPC_URLS: 'https://a' }))
        .rpcUrls,
    ).toEqual(['https://a']);
    expect(
      (
        await loadConfig({
          FASTNEAR_API_KEY: 'fast',
          RPC_URL: 'https://a',
          RPC_URLS: 'https://b',
        })
      ).rpcUrls,
    ).toEqual(['https://b']);
  });

  it('requires one auth token per endpoint', async () => {
    await expect(
      loadConfig({ RPC_AUTH_TOKENS: 'one', RPC_URL: 'https://a,https://b' }),
    ).rejects.toThrow('one entry per RPC_URL endpoint');
  });
});
