import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import sentry from '#libs/sentry';
import { syncStats } from '#services/stats/dailyStats';

export const task = async () => {
  // TODO: testnet only for now
  if (config.network === Network.MAINNET) {
    return;
  }

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
