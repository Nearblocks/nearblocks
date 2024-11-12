import { logger as log } from 'nb-logger';

import knex from '#libs/knex';
import redis from '#libs/redis';
import sentry from '#libs/sentry';
import { historicalMultiChainTxnUpdate } from '#services/tasks';

(async () => {
  try {
    await historicalMultiChainTxnUpdate();
  } catch (error) {
    log.error('aborting...');
    log.error(error);
    sentry.captureException(error);
    process.exit();
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([knex.destroy(), redis.quit(), sentry.close(1000)]);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
