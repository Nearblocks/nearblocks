import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import sentry from '#libs/sentry';

(async () => {
  logger.info({ action: 'job started', job: 'refresh-views' });
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY ft_list');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }

  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY nft_list');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }

  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY staking_pools');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }
  logger.info({ action: 'job ended', job: 'refresh-views' });

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
