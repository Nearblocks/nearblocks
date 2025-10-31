import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncStats } from '#services/stats/dailyStats';

export const task = async () => {
  try {
    logger.info('dailyStats: job started');
    await Promise.all([syncStats()]);
    logger.info('dailyStats: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('dailyStats: job error');
    logger.error(error);
  }
};
