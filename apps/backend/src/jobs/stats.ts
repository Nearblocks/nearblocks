import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import sentry from '#libs/sentry';
import { syncStats } from '#services/stats';

(async () => {
  try {
    await syncStats();
  } catch (error) {
    sentry.captureException(error);
    logger.error({ error, job: 'stats' });
    await sleep(1000);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
