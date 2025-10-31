import { logger } from 'nb-logger';

import { dbBase } from '#libs/knex';
import sentry from '#libs/sentry';

export const task = async () => {
  try {
    logger.info('refreshEthAccounts: job started');
    await Promise.all([
      dbBase.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY eth_accounts'),
    ]);
    logger.info('refreshEthAccounts: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('refreshEthAccounts: job error');
    logger.error(error);
  }
};
