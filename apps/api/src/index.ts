/* eslint-disable perfectionist/sort-imports */
import '#libs/tracing';

import { createTerminus } from '@godaddy/terminus';

import config from '#config';
import logger from '#libs/logger';

import sql from '#libs/postgres';
import redis from '#libs/redis';
import app from './app.js';

const server = app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});

const onSignal = async () => {
  logger.info('server is starting cleanup');

  try {
    server.close();
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
};

const healthCheck = async () => {
  try {
    await sql`
      SELECT
        1
    `;
    await redis.client().ping();
    return Promise.resolve(1);
  } catch (error) {
    return Promise.reject(new Error('Health check failed'));
  }
};

const options = {
  beforeShutdown: () => new Promise((resolve) => setTimeout(resolve, 10000)),
  healthChecks: {
    '/healthz': healthCheck,
  },
  onSignal,
  signals: ['SIGTERM', 'SIGINT'],
  useExit0: true,
};

createTerminus(server, options);
