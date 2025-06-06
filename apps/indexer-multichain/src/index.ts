import { logger } from 'nb-logger';

import config from '#config';
import { db } from '#libs/knex';
import sentry from '#libs/sentry';
import { syncData } from '#services/multichain';

(async () => {
  try {
    logger.info(
      { network: config.network },
      'initializing multichain indexer...',
    );
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
    await Promise.all([db.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
