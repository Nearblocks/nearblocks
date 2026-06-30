import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncPrices } from '#services/prices';

export const task = async () => {
  try {
    logger.info('tokenPrice: job started');
    await syncPrices();
    logger.info('tokenPrice: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenPrice: job error');
    logger.error(error);
  }
};
