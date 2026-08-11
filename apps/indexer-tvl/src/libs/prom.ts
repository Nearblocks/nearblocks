import client from 'prom-client';

import { logger } from 'nb-logger';
import { createMetrics } from 'nb-prom';

import config from '#config';

const metrics = createMetrics({
  indexer: 'tvl',
  network: config.network,
});

export const { register } = metrics;
export const server = metrics.startMetricsServer(3011);
server.on('listening', () =>
  logger.info('metrics server listening on port 3011'),
);

export const tvlDayHeight = new client.Gauge({
  help: 'Last UTC day (epoch ms) snapshotted per protocol/chain collector',
  labelNames: ['protocol', 'chain'],
  name: 'tvl_collector_day_height',
  registers: [register],
});

export const tvlTokensDiscovered = new client.Gauge({
  help: 'Number of tokens discovered per protocol/chain',
  labelNames: ['protocol', 'chain'],
  name: 'tvl_tokens_discovered',
  registers: [register],
});

export default metrics;
