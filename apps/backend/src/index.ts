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
  { interval: '60m', name: 'stats', timeout: '1s' }, // every 60m for now
  { cron: '0 * * * *', name: 'daily-stats', timeout: '1s' }, // run every hour for now
  { cron: '* * * * *', name: 'ft-meta' }, // every minute
  { cron: '* * * * *', name: 'ft-market-data' }, // every minute
  { cron: '* * * * *', name: 'ft-market-search' }, // every minute
  { cron: '*/5 * * * * *', hasSeconds: true, name: 'ft-total-supply' }, // every 5s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'nft-meta' }, // every 10s
  { cron: '* * * * * *', hasSeconds: true, name: 'events' }, // every second
  { cron: '*/10 * * * *', name: 'pool-id' }, // every 10 minute
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'pool-info' }, // every 10s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'staking-pool' }, // every 10s
  { cron: '*/10 * * * *', name: 'staking-pool-meta' }, // every 10 minute
  { cron: '0 0 * * *', name: 'genesis-config' }, // every day
  { cron: '0 * * * *', name: 'protocol-config' }, // every hour
  { cron: '* * * * * *', hasSeconds: true, name: 'latest-block' }, // every second
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'nodes' }, // every 10s
  { cron: '*/5 * * * * *', hasSeconds: true, name: 'nodes-telemetry' }, // every 5s
];

const bree = new Bree({ jobs, logger, root });

(async () => {
  try {
    log.info('jobs started');
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
      knex.destroy(),
      redis.quit(),
      bree.stop(),
      sentry.close(1000),
    ]);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
