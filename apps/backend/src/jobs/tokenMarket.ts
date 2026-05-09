import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncFTData } from '#services/fts/market';
import { syncMTPrice } from '#services/mts/market';

export const task = async () => {
  try {
    logger.info('tokenMarket: job started');
    await syncFTData();
    await syncMTPrice();
    logger.info('tokenMarket: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenMarket: job error');
    logger.error(error);
  }
};
