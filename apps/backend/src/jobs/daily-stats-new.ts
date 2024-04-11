import { parentPort } from 'worker_threads';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import sentry from '#libs/sentry';
import { syncStats } from '#services/dailyStatsNew';

(async () => {
  logger.info({ action: 'job started', job: 'daily-stats-new' });
  try {
    await syncStats();
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
    await sleep(1000);
  }
  logger.info({ action: 'job ended', job: 'daily-stats-new' });

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
