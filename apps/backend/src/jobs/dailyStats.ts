import { parentPort } from 'worker_threads';

import log from '#libs/log';
import sentry from '#libs/sentry';
import { sleep } from '#libs/utils';
import { syncStats } from '#services/dailyStats';

(async () => {
  try {
    await syncStats();
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
    await sleep(1000);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
