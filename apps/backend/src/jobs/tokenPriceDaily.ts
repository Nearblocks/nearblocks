import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncPriceHistory } from '#services/prices';

export const task = async () => {
  try {
    logger.info('tokenPriceDaily: job started');
    await syncPriceHistory();
    logger.info('tokenPriceDaily: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenPriceDaily: job error');
    logger.error(error);
  }
};
