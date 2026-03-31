import { describe, it, expect, afterAll } from 'vitest';
import http from 'http';
import type { MetricObjectWithValues, MetricValue } from 'prom-client';
import { createMetrics } from './index.js';

type Metric = MetricObjectWithValues<MetricValue<string>>;

describe('createMetrics', () => {
  it('returns a register with default labels set', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const text = await ctx.register.metrics();
    expect(text).toContain('indexer="test-indexer"');
    expect(text).toContain('network="testnet"');
    ctx.register.clear();
  });

  it('register includes nodejs_ or process_ default metrics', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const metrics = await ctx.register.getMetricsAsJSON();
    const hasDefault = metrics.some(
      (m: Metric) =>
        m.name.startsWith('nodejs_') || m.name.startsWith('process_'),
    );
    expect(hasDefault).toBe(true);
    ctx.register.clear();
  });

  it('register includes indexer_uptime_seconds', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const metrics = await ctx.register.getMetricsAsJSON();
    const hasUptime = metrics.some(
      (m: Metric) => m.name === 'indexer_uptime_seconds',
    );
    expect(hasUptime).toBe(true);
    ctx.register.clear();
  });

  it('register includes indexer_start_timestamp_seconds', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const metrics = await ctx.register.getMetricsAsJSON();
    const hasStart = metrics.some(
      (m: Metric) => m.name === 'indexer_start_timestamp_seconds',
    );
    expect(hasStart).toBe(true);
    ctx.register.clear();
  });
});

describe('startMetricsServer', () => {
  let server: http.Server;

  afterAll(() => {
    if (server) server.close();
  });

  it('returns a server with a close() method', () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    server = ctx.startMetricsServer(19876);
    expect(typeof server.close).toBe('function');
  });

  it('GET /metrics returns 200 with text/plain content-type', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const srv = ctx.startMetricsServer(19877);
    try {
      const res = await fetch('http://localhost:19877/metrics');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toMatch(/text\/plain/);
    } finally {
      srv.close();
      ctx.register.clear();
    }
  });

  it('GET /metrics body includes indexer and network labels', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const srv = ctx.startMetricsServer(19878);
    try {
      const res = await fetch('http://localhost:19878/metrics');
      const body = await res.text();
      expect(body).toContain('indexer="test-indexer"');
      expect(body).toContain('network="testnet"');
    } finally {
      srv.close();
      ctx.register.clear();
    }
  });

  it('GET /metrics body includes nodejs_ metrics', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const srv = ctx.startMetricsServer(19879);
    try {
      const res = await fetch('http://localhost:19879/metrics');
      const body = await res.text();
      expect(body).toContain('nodejs_');
    } finally {
      srv.close();
      ctx.register.clear();
    }
  });

  it('GET /metrics body includes indexer_uptime_seconds', async () => {
    const ctx = createMetrics({ indexer: 'test-indexer', network: 'testnet' });
    const srv = ctx.startMetricsServer(19880);
    try {
      const res = await fetch('http://localhost:19880/metrics');
      const body = await res.text();
      expect(body).toContain('indexer_uptime_seconds');
    } finally {
      srv.close();
      ctx.register.clear();
    }
  });
});
