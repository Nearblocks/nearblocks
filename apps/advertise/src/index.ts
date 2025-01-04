import { Worker } from 'bullmq';

import config from '#config';
import logger from '#libs/logger';
import { emailQueueOptions } from '#libs/queue';
import redis from '#libs/redis';
import sentry from '#libs/sentry';
import emailJob from '#services/queues/email';

import app from './app.js';

const emailWorker = new Worker('email', emailJob, emailQueueOptions);

app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});

const onSignal = (signal: number | string) => {
  const handler = async () => {
    await redis.quit();
    await sentry.close(1000);
    await emailWorker.close();
  };

  handler()
    .catch(logger.error)
    .finally(() => process.kill(process.pid, signal));
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
