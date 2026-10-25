import { afterEach, describe, expect, it, vi } from 'vitest';

const loadConfig = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return (await import('#config')).default;
};

describe('dedup deadline', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('keeps 25s with the default timeout', async () => {
    const config = await loadConfig({ BLOCK_SOURCES: 'neardata' });
    expect(config.dedupTtlMs).toBe(25_000);
  });

  it('covers one timeout per remote source when the timeout is raised', async () => {
    const config = await loadConfig({
      BLOCK_PROXY_UPSTREAM_URL: 'https://proxy.example',
      BLOCK_SOURCES: 'node,proxy,neardata',
      UPSTREAM_TIMEOUT_SECS: '20',
    });
    expect(config.dedupTtlMs).toBe(45_000);
  });

  it('caps the derived deadline at 60s', async () => {
    const config = await loadConfig({
      BLOCK_PROXY_UPSTREAM_URL: 'https://proxy.example',
      BLOCK_SOURCES: 'proxy,neardata',
      UPSTREAM_TIMEOUT_SECS: '40',
    });
    expect(config.dedupTtlMs).toBe(60_000);
  });
});

describe('shadow settings', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is off by default', async () => {
    const config = await loadConfig({ BLOCK_SOURCES: 'neardata' });
    expect(config.shadowSource).toBeNull();
  });

  it('needs the proxy URL to shadow the proxy', async () => {
    await expect(
      loadConfig({ BLOCK_SOURCES: 'neardata', SHADOW_SOURCE: 'proxy' }),
    ).rejects.toThrow('BLOCK_PROXY_UPSTREAM_URL');
    const config = await loadConfig({
      BLOCK_PROXY_UPSTREAM_URL: 'https://proxy.example',
      BLOCK_SOURCES: 'neardata',
      SHADOW_SOURCE: 'proxy',
    });
    expect(config.shadowSource).toBe('proxy');
  });

  it('rejects a sample rate outside (0, 1]', async () => {
    await expect(
      loadConfig({ BLOCK_SOURCES: 'neardata', SHADOW_SAMPLE_RATE: '0' }),
    ).rejects.toThrow('SHADOW_SAMPLE_RATE');
  });
});

describe('defaults and retired settings', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('serves from neardata with no settings', async () => {
    const config = await loadConfig({});
    expect(config.blockSources).toEqual(['neardata']);
    expect(config.dedupTtlMs).toBe(25_000);
  });

  it('keeps old names working and refuses a conflict', async () => {
    expect(
      (await loadConfig({ FASTNEAR_URL: 'https://n.example' })).neardataBaseUrl,
    ).toBe('https://n.example');
    await expect(
      loadConfig({
        FASTNEAR_URL: 'https://a.example',
        NEARDATA_URL: 'https://b.example',
      }),
    ).rejects.toThrow('disagree');
  });

  it('ignores retired settings that cannot change what is served', async () => {
    const config = await loadConfig({
      DEDUP_TTL_SECS: '10',
      FASTNEAR_ENABLED: 'true',
      S3_BUCKET: 'blocks',
      S3_ENABLED: 'true',
    });
    expect(config.blockSources).toEqual(['neardata']);
    expect(config.dedupTtlMs).toBe(25_000);
  });

  it.each([
    ['FASTNEAR_ENABLED', 'false'],
    ['NEARDATA_ENABLED', 'false'],
    ['NODE_INDEXER_ENABLED', 'true'],
    ['CACHE_COMPRESSION', 'true'],
  ])('refuses %s=%s with the replacement', async (name, value) => {
    await expect(loadConfig({ [name]: value })).rejects.toThrow(
      'no longer supported',
    );
  });

  it('refuses a shadow source that serves first', async () => {
    await expect(
      loadConfig({ BLOCK_SOURCES: 'neardata', SHADOW_SOURCE: 'neardata' }),
    ).rejects.toThrow('nothing would be compared');
  });
});
