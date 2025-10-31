import { logger } from 'nb-logger';

import { dbEvents } from '#libs/knex';
import sentry from '#libs/sentry';

export const task = async () => {
  try {
    logger.info('refreshTokenList: job started');
    await Promise.all([
      dbEvents.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY ft_list'),
      dbEvents.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY nft_list'),
    ]);
    logger.info('refreshTokenList: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('refreshTokenList: job error');
    logger.error(error);
  }
};
