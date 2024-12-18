import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import sentry from '#libs/sentry';
import { transferUsageToDB } from '#services/transferUsageToDB';

(async () => {
  logger.info({ action: 'job started', job: 'transfer-usage-to-db' });
  try {
    await transferUsageToDB();
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }
  logger.info({ action: 'job ended', job: 'transfer-usage-to-db' });

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
