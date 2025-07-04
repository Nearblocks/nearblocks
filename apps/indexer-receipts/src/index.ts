import { logger } from 'nb-logger';

import config from '#config';
import { server } from '#libs/http';
import { dbRead, dbWrite } from '#libs/knex';
import sentry from '#libs/sentry';
// import { syncData } from '#services/stream';
// Temp batch processing
import { syncData } from '#services/tempStream';

(async () => {
  try {
    logger.info(
      { network: config.network },
      'initializing receipts indexer...',
    );
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
      dbRead.destroy(),
      dbWrite.destroy(),
      sentry.close(1_000),
    ]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
