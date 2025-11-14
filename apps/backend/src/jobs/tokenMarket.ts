import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncFTData, syncFTPrice } from '#services/fts/market';

export const task = async () => {
  try {
    logger.info('tokenMarket: job started');
    await Promise.all([syncFTData(), syncFTPrice()]);
    logger.info('tokenMarket: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenMarket: job error');
    logger.error(error);
  }
};
