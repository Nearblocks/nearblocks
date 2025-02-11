import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import sentry from '#libs/sentry';

(async () => {
  logger.info({ action: 'job started', job: 'refresh-eth-account' });
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY eth_accounts');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }

  logger.info({ action: 'job ended', job: 'refresh-eth-account' });

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
