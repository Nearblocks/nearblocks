import { logger } from 'nb-logger';

import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { syncFTHolders } from '#services/ft';
import { syncNFTHolders } from '#services/nft';
import { syncTPS } from '#services/tps';

(async () => {
  try {
    await Promise.all([syncFTHolders(), syncNFTHolders(), syncTPS()]);
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
