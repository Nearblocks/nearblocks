import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { syncStats } from '#services/stats/stats';

setRpcJob('stats');

export const task = async () => {
  try {
    logger.info('stats: job started');
    await syncStats();
    logger.info('stats: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('stats: job error');
    logger.error(error);
  }
};
