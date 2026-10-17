import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BlockProxyUpstream,
  NeardataUpstream,
  RemoteBlockUpstream,
} from '#upstream/neardata';

const makeUpstream = (baseUrl: string, apiKey = '') =>
  new NeardataUpstream({
    neardataApiKey: apiKey,
    neardataBaseUrl: baseUrl,
    upstreamTimeoutMs: 1000,
  } as never);

describe('NeardataUpstream URL configuration', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [
      'https://mainnet.neardata.xyz',
      'https://mainnet.neardata.xyz/v0/block/123',
    ],
    [
      'https://proxy.example/v0?tenant=near',
      'https://proxy.example/v0/block/123?tenant=near',
    ],
  ])('uses the configured NEARDATA_URL base: %s', async (baseUrl, expected) => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetch);

    await makeUpstream(baseUrl).fetch(123);

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe(expected);
  });

  it('adds the upstream API key without discarding existing query parameters', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetch);

    await makeUpstream('https://proxy.example/v0?tenant=near', 'secret').fetch(
      123,
    );

    const url = new URL(fetch.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/v0/block/123');
    expect(url.searchParams.get('tenant')).toBe('near');
    expect(url.searchParams.get('apiKey')).toBe('secret');
  });

  it('resolves a final head from the redirect without downloading the block', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        headers: { location: 'https://archive.example/v0/block/12345' },
        status: 302,
      }),
    );
    vi.stubGlobal('fetch', fetch);

    await expect(
      makeUpstream('https://proxy.example/v0').fetchLastBlockHeight(),
    ).resolves.toBe(12345);
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: 'manual' });
  });

  it('preserves upstream 429 details for fallback and response handling', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{"error":"limited"}', {
          headers: {
            'content-type': 'application/json',
            'retry-after': '8',
          },
          status: 429,
        }),
      ),
    );
    const error = await makeUpstream('https://mainnet.neardata.xyz')
      .fetch(123)
      .catch((value) => value);
    expect(error).toMatchObject({
      body: '{"error":"limited"}',
      contentType: 'application/json',
      retryAfter: '8',
      source: 'neardata',
      status: 429,
    });
  });

  it('sends a proxy upstream key as a bearer header', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetch);
    const upstream = new BlockProxyUpstream({
      proxyUpstreamApiKey: 'upstream-secret',
      proxyUpstreamBaseUrl: 'https://proxy.example/v0',
      upstreamTimeoutMs: 1000,
    } as never);
    await upstream.fetch(123);
    expect(fetch.mock.calls[0][0]).toBe('https://proxy.example/v0/block/123');
    expect(fetch.mock.calls[0][1]).toMatchObject({
      headers: { authorization: 'Bearer upstream-secret' },
    });
  });
});

describe('upstream cooldown', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('skips a failed proxy upstream until the cooldown ends', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('connect timeout'));
    vi.stubGlobal('fetch', fetch);
    const upstream = new RemoteBlockUpstream(
      'proxy',
      'https://node.example/v0',
      1000,
      '',
      'bearer',
      50,
    );
    await expect(upstream.fetch(1)).rejects.toThrow('connect timeout');
    // Within the cooldown: no request at all, so no timeout to wait out.
    await expect(upstream.fetchLastBlockHeight()).rejects.toThrow(
      'skipped after a recent failure',
    );
    expect(fetch).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 60));
    fetch.mockResolvedValue(new Response('{"ok":true}'));
    await upstream.fetch(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not cool down on a miss or for neardata', async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetch);
    const proxy = new RemoteBlockUpstream(
      'proxy',
      'https://node.example/v0',
      1000,
      '',
      'bearer',
      60_000,
    );
    await expect(proxy.fetch(1)).rejects.toMatchObject({ notFound: true });
    await expect(proxy.fetch(2)).rejects.toMatchObject({ notFound: true });
    expect(fetch).toHaveBeenCalledTimes(2);

    fetch.mockRejectedValue(new Error('down'));
    const neardata = makeUpstream('https://mainnet.neardata.xyz');
    await expect(neardata.fetch(1)).rejects.toThrow('down');
    await expect(neardata.fetch(2)).rejects.toThrow('down');
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});
