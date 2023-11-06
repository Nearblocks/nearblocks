import { parentPort } from 'worker_threads';

import knex from '#libs/knex';
import log from '#libs/log';
import sentry from '#libs/sentry';
import { sleep } from '#libs/utils';

const catchError = async (error: unknown) => {
  log.error(error);
  sentry.captureException(error);
  await sleep(1000);
};

(async () => {
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY ft_holders');
  } catch (error) {
    await catchError(error);
  }
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY nft_holders');
  } catch (error) {
    await catchError(error);
  }
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY ft_list');
  } catch (error) {
    await catchError(error);
  }
  try {
    await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY nft_list');
  } catch (error) {
    await catchError(error);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
