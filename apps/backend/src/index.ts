import path from 'path';
import { fileURLToPath } from 'url';

import Bree from 'bree';

import knex from '#libs/knex';
import log from '#libs/log';
import sentry from '#libs/sentry';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jobs');
const logger: Bree.BreeLogger = {
  error: () => {
    //
  },
  info: () => {
    //
  },
  warn: () => {
    //
  },
};
const jobs: Bree.JobOptions[] = [
  // { name: 'stats', cron: '*/15 * * * * *', hasSeconds: true }, // every 15 seconds
  // { name: 'dailyStats', cron: '1 1 * * *' }, // every day at 01:01
  // { name: 'ftMeta', cron: '* * * * *' }, // every minute
  // { name: 'nftMeta', cron: '*/20 * * * * *', hasSeconds: true }, // every 20 seconds
  // { name: 'marketData', cron: '* * * * *' }, // every minute
  // { name: 'marketSearch', cron: '* * * * *' }, // every minute
  // { name: 'ftTotalSupply', cron: '*/5 * * * * *', hasSeconds: true }, // every 5 seconds
  // { name: 'refreshViews', cron: '*/15 * * * *' }, // every 15 minutes
  { cron: '0 0 1 1 *', name: 'stats' },
];

const bree = new Bree({ jobs, logger, root });

(async () => {
  try {
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
    await bree.stop();
    await sentry.close(1000);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
