import { logger } from 'nb-logger';

import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { syncAccount } from '#services/account/index';
import { syncFT } from '#services/ft/index';
import { syncNFT } from '#services/nft/index';
import { syncTxn } from '#services/txn/index';

(async () => {
  try {
    await Promise.all([syncAccount(), syncFT(), syncNFT(), syncTxn()]);
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([knex.destroy(), sentry.close(1000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
