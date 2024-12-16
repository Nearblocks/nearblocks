import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { prepareCache } from '#services/cache';
import { storeChunks } from '#services/chunk';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';
import { storeTransactions } from '#services/transaction';
import { DataSource } from '#types/enum';

const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.s3Endpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.s3Endpoint;
}

// Create the tracer for OpenTelemetry
const tracer = trace.getTracer('block-processor');

export const syncData = async () => {
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  if (config.dataSource === DataSource.FAST_NEAR) {
    let startBlockHeight = config.startBlockHeight;

    if (!startBlockHeight && block) {
      const next = +block.block_height - config.delta / 2;
      startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
      logger.info(`syncing from block: ${next}`);
    }

    const stream = streamBlock({
      limit: config.preloadSize / 2,
      network: config.network,
      start: startBlockHeight || config.genesisHeight,
      url: config.fastnearEndpoint,
    });

    for await (const message of stream) {
      await onMessage(message);
    }

    stream.on('end', () => {
      logger.error('stream ended');
      process.exit();
    });
    stream.on('error', (error: Error) => {
      logger.error(error);
      process.exit();
    });
  } else {
    if (!lakeConfig.startBlockHeight && block) {
      const next = +block.block_height - config.delta;
      lakeConfig.startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
      logger.info(`syncing from block: ${next}`);
    }

    for await (const message of stream(lakeConfig)) {
      await onMessage(message);
    }
  }
};

export const onMessage = async (message: types.StreamerMessage) => {
  // Create a span for processing each block
  const span = tracer.startSpan('process.block', {
    attributes: {
      'block.hash': message.block.header.hash,
      'block.height': message.block.header.height,
      'block.prev_hash': message.block.header.prevHash,
      'block.timestamp': message.block.header.timestamp,
    },
  });

  try {
    // Set the current span as active for this async context
    await context.with(trace.setSpan(context.active(), span), async () => {
      if (message.block.header.height % 1000 === 0)
        logger.info(`syncing block: ${message.block.header.height}`);

      const start = performance.now();

      await prepareCache(message);

      await storeBlock(knex, message);

      await storeChunks(knex, message);

      await storeTransactions(knex, message);

      await storeReceipts(knex, message);

      // Create a parent span for parallel operations
      const parallelSpan = tracer.startSpan('store.parallel_operations');
      try {
        await Promise.all([
          storeExecutionOutcomes(knex, message),
          storeAccounts(knex, message),
          storeAccessKeys(knex, message),
        ]);
        parallelSpan.setStatus({ code: SpanStatusCode.OK });
      } finally {
        parallelSpan.end();
      }

      const processingTime = performance.now() - start;
      span.setAttribute('processing.time_ms', processingTime);

      logger.info({
        block: message.block.header.height,
        time: `${processingTime} ms`,
      });

      span.setStatus({ code: SpanStatusCode.OK });
    });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    process.exit();
  } finally {
    span.end();
  }
};
