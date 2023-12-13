import path from 'path';
import { fileURLToPath } from 'url';

import Bree from 'bree';

import { logger as log } from 'nb-logger';

import knex from '#libs/knex';
import { redisClient } from '#libs/redis';
import sentry from '#libs/sentry';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jobs');

const logger: Bree.BreeLogger = {
  error: () => {
    //
  },
  info: () => {},
  warn: () => {
    //
  },
};

const jobs: Bree.JobOptions[] = [
  { cron: '* * * * * *', hasSeconds: true, name: 'events' },
  {
    closeWorkerAfterMs: 10000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'main',
  }, // every 10s
  {
    closeWorkerAfterMs: 15000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'updatepoolinfo',
  }, // every 10s
  {
    closeWorkerAfterMs: 10000,
    cron: '*/10 * * * * *',
    hasSeconds: true,
    name: 'updatestakingpool',
  }, // every 10s
  { cron: '0 0 * * *', name: 'genesisconfig' }, // every day
  { cron: '0 * * * *', name: 'protocolconfig' }, // every hour
  { cron: '*/5 * * * * *', hasSeconds: true, name: 'latestblock' }, // every 5s
  { cron: '*/10 * * * *', name: 'poolid' }, // every 10 minute
];

const bree = new Bree({ jobs, logger, root });

(async () => {
  try {
    log.info('Job started');
    await redisClient.connect();
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
    await knex.destroy();
    await redisClient.quit();
    await bree.stop();
    await sentry.close(1000);
  } catch (error) {
    log.info('error ');
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
