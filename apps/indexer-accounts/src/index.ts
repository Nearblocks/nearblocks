import { logger } from 'nb-logger';

import config from '#config';
import { db } from '#libs/knex';
import { server } from '#libs/prom';
import sentry from '#libs/sentry';
import { backfillData } from '#services/backfill';
import { syncGenesis } from '#services/genesis';

(async () => {
  try {
    logger.info({ network: config.network }, 'initializing indexer...');
    logger.info('syncing genesis data...');
    await syncGenesis();
    logger.info('backfilling blockchain data from db...');
    await backfillData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    await Promise.all([server.close(), db.destroy(), sentry.close(1_000)]);
    process.exit(1);
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([server.close(), db.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
