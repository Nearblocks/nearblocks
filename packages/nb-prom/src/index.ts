import http from 'http';
import client from 'prom-client';
import {
  createSyncMetrics,
  createPerfMetrics,
  createErrorMetrics,
  createInfraMetrics,
} from './metrics.js';

export type {
  SyncMetrics,
  PerfMetrics,
  ErrorMetrics,
  InfraMetrics,
} from './metrics.js';
export { startChainTipPoller } from './chain-tip.js';
export type { ChainTipOptions, ChainTipPoller } from './chain-tip.js';
export {
  createSyncMetrics,
  createPerfMetrics,
  createErrorMetrics,
  createInfraMetrics,
} from './metrics.js';

export interface MetricsOptions {
  indexer: string;
  network: string;
}

export interface MetricsContext {
  register: client.Registry;
  startMetricsServer: (port?: number) => http.Server;
  sync: ReturnType<typeof createSyncMetrics>;
  perf: ReturnType<typeof createPerfMetrics>;
  errors: ReturnType<typeof createErrorMetrics>;
  infra: ReturnType<typeof createInfraMetrics>;
}

export function createMetrics(options: MetricsOptions): MetricsContext {
  const register = new client.Registry();

  register.setDefaultLabels({
    indexer: options.indexer,
    network: options.network,
  });

  client.collectDefaultMetrics({ register });

  const startTimestamp = Date.now() / 1000;

  new client.Gauge({
    help: 'Unix timestamp (seconds) when the indexer process started',
    name: 'indexer_start_timestamp_seconds',
    registers: [register],
    collect() {
      this.set(startTimestamp);
    },
  });

  new client.Gauge({
    help: 'Number of seconds the indexer process has been running',
    name: 'indexer_uptime_seconds',
    registers: [register],
    collect() {
      this.set(Date.now() / 1000 - startTimestamp);
    },
  });

  function startMetricsServer(port = 3010): http.Server {
    const server = http.createServer(async (req, res) => {
      if (req.url === '/metrics' && req.method === 'GET') {
        const metrics = await register.metrics();
        res
          .writeHead(200, { 'Content-Type': register.contentType })
          .end(metrics);
      } else {
        res.writeHead(404).end('Not found');
      }
    });

    server.requestTimeout = 5000;
    server.headersTimeout = 5000;

    server.on('error', (err) => {
      console.error('Metrics server error:', err);
    });

    server.listen(port);
    return server;
  }

  const sync = createSyncMetrics(register);
  const perf = createPerfMetrics(register);
  const errors = createErrorMetrics(register);
  const infra = createInfraMetrics(register);

  return { errors, infra, perf, register, startMetricsServer, sync };
}
