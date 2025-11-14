import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncStats } from '#services/stats/stats';

export const task = async () => {
  try {
    logger.info('stats: job started');
    await Promise.all([syncStats()]);
    logger.info('stats: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('stats: job error');
    logger.error(error);
  }
};
