import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import knex, { baseKnex } from '#libs/knex';
import sentry from '#libs/sentry';
import { syncIntentsSwaps } from '#services/swaps';

(async () => {
  try {
    if (config.network !== Network.MAINNET) {
      logger.info('intents indexer is mainnet only, idling...');
      await new Promise(() => {});
    }

    await syncIntentsSwaps();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    await Promise.all([
      knex.destroy(),
      baseKnex.destroy(),
      sentry.close(1_000),
    ]);
    process.exit(1);
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([knex.destroy(), baseKnex.destroy(), sentry.close(1000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
