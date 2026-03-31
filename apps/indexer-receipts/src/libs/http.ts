import { logger } from 'nb-logger';

import metrics from '#libs/prom';

export const server = metrics.startMetricsServer(3010);
server.on('listening', () =>
  logger.info('metrics server listening on port 3010'),
);
