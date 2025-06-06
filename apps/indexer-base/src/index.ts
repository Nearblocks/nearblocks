import { logger } from 'nb-logger';

import config from '#config';
import { server } from '#libs/http';
import { dbMigration, dbRead, dbWrite } from '#libs/knex';
import sentry from '#libs/sentry';
import { syncGenesis } from '#services/genesis';
// import { syncData } from '#services/stream';
// Temp stream from s3
import { syncData } from '#services/tempStream';

(async () => {
  try {
    logger.info({ network: config.network }, 'initializing indexer...');
    await dbMigration.migrate.latest();
    await dbMigration.destroy();
    logger.info('syncing genesis data...');
    await syncGenesis();
    logger.info('syncing blockchain data...');
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
    await Promise.all([
      server.close(),
      dbWrite.destroy(),
      dbRead.destroy(),
      sentry.close(1_000),
    ]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
