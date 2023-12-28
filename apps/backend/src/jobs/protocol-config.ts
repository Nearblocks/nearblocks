import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { createApiRedis } from '#libs/redis';
import sentry from '#libs/sentry';
import { protocolConfigCheck } from '#services/tasks';

(async () => {
  const redis = createApiRedis();
  const redisClient = redis.client();

  try {
    await redisClient.connect();
    await protocolConfigCheck(redis);
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }

  redisClient.disconnect();

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
