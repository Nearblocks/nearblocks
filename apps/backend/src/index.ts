import path from 'path';
import { fileURLToPath } from 'url';

import Bree from 'bree';

import { logger as log } from 'nb-logger';

import knex from '#libs/knex';
import redis from '#libs/redis';
import sentry from '#libs/sentry';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jobs');

const logger: Bree.BreeLogger = {
  error: () => {},
  info: () => {},
  warn: () => {},
};

const jobs: Bree.JobOptions[] = [
  { cron: '* * * * * *', hasSeconds: true, name: 'events' },
  {
    closeWorkerAfterMs: 10000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'node-validator',
  }, // every 10s
  {
    closeWorkerAfterMs: 15000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'update-pool-info',
  }, // every 10s
  {
    closeWorkerAfterMs: 10000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'update-staking-pool',
  }, // every 10s
  { cron: '0 0 * * *', name: 'genesis-config', timeout: '5s' }, // every day
  { cron: '0 * * * *', name: 'protocol-config', timeout: '5s' }, // every hour
  { cron: '*/5 * * * * *', hasSeconds: true, name: 'latest-block' }, // every 5s
  { cron: '*/10 * * * *', name: 'pool-id', timeout: '5s' }, // every 10 minute
];

const bree = new Bree({ jobs, logger, root });

(async () => {
  try {
    log.info('Job started');
    await bree.start();
  } catch (error) {
    log.error('aborting...');
    log.error(error);
    sentry.captureException(error);
    process.exit();
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([
      await knex.destroy(),
      await redis.quit(),
      await bree.stop(),
      await sentry.close(1000),
    ]);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
