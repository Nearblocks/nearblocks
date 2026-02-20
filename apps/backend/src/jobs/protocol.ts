import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { protocolConfigCheck } from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('protocol: job started');
    await Promise.all([protocolConfigCheck()]);
    logger.info('protocol: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('protocol: job error');
    logger.error(error);
  }
};
