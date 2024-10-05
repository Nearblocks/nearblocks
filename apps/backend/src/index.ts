import path from 'path';
import { fileURLToPath } from 'url';

import Bree from 'bree';

import { logger as log } from 'nb-logger';

import knex from '#libs/knex';
import redis from '#libs/redis';
import sentry from '#libs/sentry';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jobs');

const logger: Bree.BreeLogger = {
  error: console.log,
  info: console.log,
  warn: () => {},
};

const errorHandler = (error: unknown) => {
  log.error(error);
  sentry.captureException(error);
};

const jobs: Bree.JobOptions[] = [
  { cron: '*/15 * * * * *', hasSeconds: true, name: 'stats' }, // every 15s
  // { cron: '1 0 * * *', name: 'daily-stats', timeout: '5s' }, // every day at 00:01:00
  { cron: '1 0 * * *', name: 'daily-stats-new', timeout: '15s' }, // run every 30m for now
  { cron: '0 */12 * * *', name: 'circulating-supply', timeout: '30s' }, // run every 12h for now
  { cron: '* * * * *', name: 'ft-meta' }, // every minute
  { cron: '* * * * *', name: 'ft-market-data' }, // every minute
  { cron: '* * * * *', name: 'ft-market-search' }, // every minute
  { cron: '*/5 * * * * *', hasSeconds: true, name: 'ft-total-supply' }, // every 5s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'nft-meta' }, // every 10s
  { cron: '*/5 * * * *', name: 'refresh-views', timeout: '45s' }, // every 5m
  // { cron: '*/5 * * * * *', hasSeconds: true, name: 'events' }, // every 5s
  { cron: '*/10 * * * *', name: 'pool-id' }, // every 10 minute
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'pool-info' }, // every 10s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'staking-pool' }, // every 10s
  { cron: '*/10 * * * *', name: 'staking-pool-meta', timeout: '10s' }, // every 10 minute
  { cron: '0 0 * * *', name: 'genesis-config', timeout: '10s' }, // every day
  { cron: '0 * * * *', name: 'protocol-config', timeout: '10s' }, // every hour
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'latest-block' }, // every 10s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'nodes' }, // every 10s
  { cron: '*/10 * * * * *', hasSeconds: true, name: 'nodes-telemetry' }, // every 10s
  // { cron: '* * * * *', name: 'ft-meta-hex-address' }, // every minute
];

const bree = new Bree({ errorHandler, jobs, logger, root });

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
