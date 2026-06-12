import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncFTPrices } from '#services/fts/prices';
import { syncMTPrices } from '#services/mts/prices';

export const task = async () => {
  try {
    logger.info('tokenPrices: job started');
    await syncFTPrices();
    await syncMTPrices();
    logger.info('tokenPrices: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenPrices: job error');
    logger.error(error);
  }
};
