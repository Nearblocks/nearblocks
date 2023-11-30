import path from 'path';
import { fileURLToPath } from 'url';

import Bree from 'bree';

import { logger as log } from 'nb-logger';

import knex from '#libs/knex';
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
  { cron: '0 0 1 1 * *', hasSeconds: true, name: 'stats' },
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
