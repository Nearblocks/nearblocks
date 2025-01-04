/* eslint-disable perfectionist/sort-imports */
import '#libs/tracing';
import config from '#config';
import logger from '#libs/logger';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import redis from '#libs/redis';
import sentry from '#libs/sentry';

import app from './app.js';

app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([
      redis.quit(),
      ratelimiterRedisClient.quit(),
      sentry.close(1000),
    ]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
