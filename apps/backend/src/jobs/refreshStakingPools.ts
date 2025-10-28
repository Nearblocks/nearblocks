import { logger } from 'nb-logger';

import { dbBase } from '#libs/knex';
import sentry from '#libs/sentry';

export const task = async () => {
  try {
    logger.info('refreshStakingPools: job started');
    await Promise.all([
      dbBase.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY staking_pools'),
    ]);
    logger.info('refreshStakingPools: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('refreshStakingPools: job error');
    logger.error(error);
  }
};
