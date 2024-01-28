import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import sentry from '#libs/sentry';
import { syncTotalSupply } from '#services/fts';

(async () => {
  try {
    await syncTotalSupply();
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
