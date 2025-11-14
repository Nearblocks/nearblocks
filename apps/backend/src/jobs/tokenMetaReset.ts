import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { resetMeta } from '#services/contracts/deployments';

export const task = async () => {
  try {
    logger.info('tokenMetaReset: job started');
    await Promise.all([resetMeta()]);
    logger.info('tokenMetaReset job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenMetaReset: job error');
    logger.error(error);
  }
};
