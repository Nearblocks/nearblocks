import client from 'prom-client';

import { logger } from 'nb-logger';
import { createMetrics } from 'nb-prom';

import config from '#config';

const metrics = createMetrics({ indexer: 'ft-state', network: config.network });

export const { register } = metrics;
export const server = metrics.startMetricsServer(3010);
server.on('listening', () =>
  logger.info('metrics server listening on port 3010'),
);

export const audit = {
  auditsTotal: new client.Counter({
    help: 'Total number of contracts audited, by verdict',
    labelNames: ['status'],
    name: 'ft_state_audit_total',
    registers: [register],
  }),
  oldestCheckedAtSeconds: new client.Gauge({
    help: 'Age in seconds of the least recently audited row still in rotation',
    name: 'ft_state_audit_oldest_checked_at_seconds',
    registers: [register],
  }),
  pendingBacklog: new client.Gauge({
    help: 'Number of contracts in the roster never yet audited',
    name: 'ft_state_audit_pending_backlog',
    registers: [register],
  }),
  rpcCallsTotal: new client.Counter({
    help: 'Total number of RPC calls made by the audit loop',
    name: 'ft_state_audit_rpc_calls_total',
    registers: [register],
  }),
};

export default metrics;
