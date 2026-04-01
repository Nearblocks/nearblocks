import client from 'prom-client';
import { logger } from 'nb-logger';
import { createMetrics } from 'nb-prom';

import config from '#config';

const metrics = createMetrics({
  indexer: 'multichain',
  network: config.network,
});

export const { register } = metrics;
export const server = metrics.startMetricsServer(3010);
server.on('listening', () =>
  logger.info('metrics server listening on port 3010'),
);

export const chainBlockHeight = new client.Gauge({
  help: 'Current block height per chain',
  labelNames: ['chain'],
  name: 'multichain_chain_block_height',
  registers: [register],
});

export const chainBlocksProcessed = new client.Counter({
  help: 'Total blocks processed per chain',
  labelNames: ['chain'],
  name: 'multichain_chain_blocks_processed_total',
  registers: [register],
});

export default metrics;
