import { parentPort } from 'worker_threads';

import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { snapshotFTBalance } from '#services/events';

(async () => {
  try {
    await knex.transaction(async (trx) => {
      await snapshotFTBalance(trx);
    });
  } catch (error) {
    sentry.captureException(error);
    await sleep(1000);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
