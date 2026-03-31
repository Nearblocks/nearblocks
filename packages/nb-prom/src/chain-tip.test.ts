import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import client from 'prom-client';
import { startChainTipPoller } from './chain-tip.js';

describe('startChainTipPoller', () => {
  let register: client.Registry;

  beforeEach(() => {
    register = new client.Registry();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches tip height immediately on start and sets gauge', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        '# HELP block_proxy_tip_height Current chain tip\n# TYPE block_proxy_tip_height gauge\nblock_proxy_tip_height 12345678\n',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { stop, chainTipHeight } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
    });

    // Flush the immediate fetch promise
    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/metrics',
      expect.objectContaining({ signal: expect.anything() }),
    );
    const metrics = await register.getMetricsAsJSON();
    const tipMetric = metrics.find(
      (m) => m.name === 'indexer_chain_tip_height',
    );
    expect(tipMetric).toBeDefined();
    expect((tipMetric?.values as { value: number }[])[0]?.value).toBe(12345678);

    stop();
  });

  it('polls again after intervalMs', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'block_proxy_tip_height 100\n',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    stop();
  });

  it('does not throw on fetch network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const warnSpy = vi.fn();
    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
      logger: { warn: warnSpy },
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(warnSpy).toHaveBeenCalled();

    stop();
  });

  it('does not throw on non-200 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });
    vi.stubGlobal('fetch', mockFetch);

    const warnSpy = vi.fn();
    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
      logger: { warn: warnSpy },
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(warnSpy).toHaveBeenCalled();

    stop();
  });

  it('does not throw on malformed response with no matching line', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '# only comments here\n# nothing useful\n',
    });
    vi.stubGlobal('fetch', mockFetch);

    const warnSpy = vi.fn();
    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
      logger: { warn: warnSpy },
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(warnSpy).toHaveBeenCalled();

    stop();
  });

  it('stop() prevents further polling after being called', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'block_proxy_tip_height 999\n',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
      intervalMs: 1000,
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    const countAfterStart = mockFetch.mock.calls.length;

    stop();

    await vi.advanceTimersByTimeAsync(3000);
    expect(mockFetch.mock.calls.length).toBe(countAfterStart);
  });

  it('uses default interval of 5000ms', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'block_proxy_tip_height 1\n',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { stop } = startChainTipPoller({
      register,
      blockProxyUrl: 'http://localhost:3000',
    });

    // Flush promise microtasks (fetch + text() are two async hops)
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Not yet 5 seconds
    await vi.advanceTimersByTimeAsync(4999);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Now 5 seconds elapsed
    await vi.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    stop();
  });
});
