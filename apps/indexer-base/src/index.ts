import { trace } from '@opentelemetry/api';

import { logger } from 'nb-logger';

import config from '#config';
import knex from '#libs/knex';
import { setupTracing } from '#libs/tracing';
import { syncCollidedTxns } from '#services/collidedTxns';
import { syncGenesis } from '#services/genesis';
import { syncData } from '#services/stream';

const sdk = setupTracing();

(async () => {
  const span = trace.getTracer('base-indexer').startSpan('sync.base-indexer');

  try {
    logger.info(
      { data_source: config.dataSource, network: config.network },
      'initializing base indexer...',
    );
    logger.info('syncing genesis data...');
    await syncGenesis();
    logger.info('syncing collided txn data...');
    await syncCollidedTxns();
    logger.info('syncing blockchain data...');
    await syncData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    span.recordException(error as Error);
    span.setStatus({
      code: 2,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit();
  } finally {
    span.end();
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([sdk.shutdown(), knex.destroy()]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
