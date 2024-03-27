import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import sentry from '#libs/sentry';
import { syncCirculatingSupply } from '#services/supply';

(async () => {
  logger.info({ action: 'job started', job: 'circulating-supply' });
  try {
    await syncCirculatingSupply();
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }
  logger.info({ action: 'job ended', job: 'circulating-supply' });

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
