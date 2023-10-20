import log from '#libs/log';
import config from '#config';
import knex from '#libs/knex';
import redis from '#libs/redis';
import sentry from '#libs/sentry';
import { syncData } from '#services/stream';

(async () => {
  try {
    log.info({ network: config.network }, 'initializing indexer...');
    await redis.connect();
    log.info('syncing blockchain data...');
    await syncData();
  } catch (error) {
    log.error('aborting...');
    log.error(error);
    sentry.captureException(error);
    process.exit();
  }
})();

const onSignal = async (signal: string | number) => {
  try {
    await knex.destroy();
    await redis.quit();
    await sentry.close(1000);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
