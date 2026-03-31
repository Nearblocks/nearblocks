import { describe, it, expect, beforeEach } from 'vitest';
import client from 'prom-client';
import type { MetricObjectWithValues, MetricValue } from 'prom-client';
import {
  createSyncMetrics,
  createPerfMetrics,
  createErrorMetrics,
  createInfraMetrics,
} from './metrics.js';

type Metric = MetricObjectWithValues<MetricValue<string>>;

describe('createSyncMetrics', () => {
  let register: client.Registry;

  beforeEach(() => {
    register = new client.Registry();
  });

  it('returns object with expected keys', () => {
    const sync = createSyncMetrics(register);
    expect(sync).toHaveProperty('blockHeight');
  });

  it('blockHeight is registered and reports value', async () => {
    const sync = createSyncMetrics(register);
    sync.blockHeight.set(12345);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_block_height',
    );
    expect(found).toBe(true);
  });
});

describe('createPerfMetrics', () => {
  let register: client.Registry;

  beforeEach(() => {
    register = new client.Registry();
  });

  it('returns object with expected keys', () => {
    const perf = createPerfMetrics(register);
    expect(perf).toHaveProperty('blockProcessingSeconds');
    expect(perf).toHaveProperty('blocksProcessedTotal');
  });

  it('blockProcessingSeconds histogram is registered', async () => {
    const perf = createPerfMetrics(register);
    perf.blockProcessingSeconds.observe(0.05);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_block_processing_seconds',
    );
    expect(found).toBe(true);
  });

  it('blocksProcessedTotal counter is registered', async () => {
    const perf = createPerfMetrics(register);
    perf.blocksProcessedTotal.inc(1);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_blocks_processed_total',
    );
    expect(found).toBe(true);
  });
});

describe('createErrorMetrics', () => {
  let register: client.Registry;

  beforeEach(() => {
    register = new client.Registry();
  });

  it('returns object with expected keys', () => {
    const errors = createErrorMetrics(register);
    expect(errors).toHaveProperty('errorsTotal');
  });

  it('errorsTotal counter supports type label', async () => {
    const errors = createErrorMetrics(register);
    errors.errorsTotal.inc({ type: 'rpc' });
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_errors_total',
    );
    expect(found).toBe(true);
  });
});

describe('createInfraMetrics', () => {
  let register: client.Registry;

  beforeEach(() => {
    register = new client.Registry();
  });

  it('returns object with expected keys', () => {
    const infra = createInfraMetrics(register);
    expect(infra).toHaveProperty('dbPoolActive');
    expect(infra).toHaveProperty('dbPoolIdle');
    expect(infra).toHaveProperty('dbPoolWaiting');
  });

  it('dbPoolActive gauge is registered', async () => {
    const infra = createInfraMetrics(register);
    infra.dbPoolActive.set(3);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_db_pool_active',
    );
    expect(found).toBe(true);
  });

  it('dbPoolIdle gauge is registered', async () => {
    const infra = createInfraMetrics(register);
    infra.dbPoolIdle.set(7);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_db_pool_idle',
    );
    expect(found).toBe(true);
  });

  it('dbPoolWaiting gauge is registered', async () => {
    const infra = createInfraMetrics(register);
    infra.dbPoolWaiting.set(0);
    const metrics = await register.getMetricsAsJSON();
    const found = metrics.some(
      (m: Metric) => m.name === 'indexer_db_pool_waiting',
    );
    expect(found).toBe(true);
  });
});
