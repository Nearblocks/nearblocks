import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { latestBlockCheck } from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('block: job started');
    await latestBlockCheck();
    logger.info('block: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('block: job error');
    logger.error(error);
  }
};
