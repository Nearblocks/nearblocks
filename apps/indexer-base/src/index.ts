import { logger } from 'nb-logger';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { syncCollidedTxns } from '#services/collidedTxns';
import { syncGenesis } from '#services/genesis';
import { syncData } from '#services/stream';

(async () => {
  try {
    logger.info(
      { data_source: config.dataSource, network: config.network },
      'initializing base indexer...',
    );
    logger.info('syncing genesis data...');
    await syncGenesis();
    logger.info('syncing collided txn data...');
    await syncCollidedTxns();
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
    await Promise.all([knex.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
