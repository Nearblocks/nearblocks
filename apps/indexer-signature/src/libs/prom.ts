import { logger } from 'nb-logger';
import { createMetrics } from 'nb-prom';

import config from '#config';

const metrics = createMetrics({
  indexer: 'signature',
  network: config.network,
});

export const { register } = metrics;
export const server = metrics.startMetricsServer(3010);
server.on('listening', () =>
  logger.info('metrics server listening on port 3010'),
);

export default metrics;
