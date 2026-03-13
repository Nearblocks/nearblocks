import { logger } from 'nb-logger';

import config from '#config';
import { db, dbMigration } from '#libs/knex';
import sentry from '#libs/sentry';
import { syncData } from '#services/stream';

(async () => {
  try {
    logger.info({ network: config.network }, 'initializing indexer...');
    await dbMigration.migrate.latest();
    await dbMigration.destroy();
    await syncData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    await Promise.all([db.destroy(), sentry.close(1_000)]);
    process.exit(1);
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([db.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
process.once('unhandledRejection', async (error) => {
  logger.error('unhandled rejection');
  logger.error(error);
  sentry.captureException(error);
  await Promise.all([db.destroy(), sentry.close(1_000)]);
  process.exit(1);
});
