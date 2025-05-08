import { logger } from 'nb-logger';

import config from '#config';
import { db, dbBase } from '#libs/knex';
import sentry from '#libs/sentry';
import { migrationCheck } from '#libs/utils';
import { syncData } from '#services/stream';

(async () => {
  try {
    logger.info({ network: config.network }, 'initializing indexer...');
    await migrationCheck();
    await syncData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([db.destroy(), dbBase.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
