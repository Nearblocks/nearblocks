import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncFTSupply } from '#services/fts/supply';

export const task = async () => {
  try {
    logger.info('tokenSupply: job started');
    await Promise.all([syncFTSupply()]);
    logger.info('tokenSupply: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenSupply: job error');
    logger.error(error);
  }
};
