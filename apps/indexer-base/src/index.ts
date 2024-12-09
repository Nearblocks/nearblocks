import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { logger } from 'nb-logger';
import config from '#config';
import knex from '#libs/knex';
import { syncCollidedTxns } from '#services/collidedTxns';
import { syncGenesis } from '#services/genesis';
import { syncData } from '#services/stream';
import { setupTracing } from '#libs/tracing';

const sdk = setupTracing();
const tracer = trace.getTracer('base-indexer');

(async () => {
  const span = tracer.startSpan('indexer.initialize');

  try {
    context.with(trace.setSpan(context.active(), span), async () => {
      logger.info(
        { data_source: config.dataSource, network: config.network },
        'initializing base indexer...',
      );

      const genesisSpan = tracer.startSpan('sync.genesis');
      try {
        logger.info('syncing genesis data...');
        await syncGenesis();
        genesisSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        genesisSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      } finally {
        genesisSpan.end();
      }

      const collidedSpan = tracer.startSpan('sync.collided_txns');
      try {
        logger.info('syncing collided txn data...');
        await syncCollidedTxns();
        collidedSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        collidedSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      } finally {
        collidedSpan.end();
      }

      const streamSpan = tracer.startSpan('sync.blockchain_data');
      try {
        logger.info('syncing blockchain data...');
        await syncData();
        streamSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        streamSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      } finally {
        streamSpan.end();
      }
    });

    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.error('aborting...');
    logger.error(error);
    process.exit(1);
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
