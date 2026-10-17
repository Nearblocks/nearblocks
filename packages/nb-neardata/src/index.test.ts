import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFinal, neardataApiUrl } from './index.js';

describe('NEAR data endpoint configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('joins API paths without losing a configured API key query', () => {
    expect(
      neardataApiUrl(
        'https://proxy.example/v0?api_key=secret',
        '/v0/last_block/final',
      ),
    ).toBe('https://proxy.example/v0/last_block/final?api_key=secret');
  });

  it('accepts a proxy origin as the configured base URL', () => {
    expect(neardataApiUrl('http://127.0.0.1:3000', '/v0/block/123')).toBe(
      'http://127.0.0.1:3000/v0/block/123',
    );
  });

  it('sends an explicitly configured Authorization header', async () => {
    vi.stubEnv('NEARDATA_AUTHORIZATION', 'Bearer test-secret');
    const request = vi
      .fn()
      .mockResolvedValue(Response.json({ block: { header: { height: 123 } } }));
    vi.stubGlobal('fetch', request);

    await fetchFinal(
      'mainnet',
      'https://proxy.example/v0?api_key=query-secret',
    );

    expect(request).toHaveBeenCalledOnce();
    const [url, options] = request.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://proxy.example/v0/last_block/final?api_key=query-secret',
    );
    expect(new Headers(options.headers).get('authorization')).toBe(
      'Bearer test-secret',
    );
  });

  it('can build a Bearer header from NEARDATA_API_KEY', async () => {
    vi.stubEnv('NEARDATA_API_KEY', 'test-secret');
    const request = vi
      .fn()
      .mockResolvedValue(Response.json({ block: { header: { height: 123 } } }));
    vi.stubGlobal('fetch', request);

    await fetchFinal('mainnet', 'http://127.0.0.1:3000');

    const [, options] = request.mock.calls[0] as [string, RequestInit];
    expect(new Headers(options.headers).get('authorization')).toBe(
      'Bearer test-secret',
    );
  });
});
