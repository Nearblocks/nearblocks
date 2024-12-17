import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { types } from 'near-lake-framework';

import { retry } from 'nb-utils';

import config from '#config';
import redis from '#libs/redis';

const cacheTracer = trace.getTracer('cache-processor');

export const prepareCache = async (message: types.StreamerMessage) => {
  const cacheSpan = cacheTracer.startSpan('prepare.cache', {
    attributes: {
      'block.hash': message.block.header.hash,
      'block.height': message.block.header.height,
    },
  });

  try {
    // Set the current span as active for this async context
    await context.with(trace.setSpan(context.active(), cacheSpan), async () => {
      const chunks = message.shards.flatMap((shard) => shard.chunk || []);
      const txns = chunks.flatMap((chunk) => chunk.transactions);
      const receipts = chunks.flatMap((chunk) => chunk.receipts);
      const outcomes = message.shards.flatMap(
        (shard) => shard.receiptExecutionOutcomes,
      );

      await Promise.all([
        txns.map(async (txn) => {
          const transactionHash = txn.transaction.hash;
          const receiptId = txn.outcome.executionOutcome.outcome.receiptIds[0];

          await redis.set(receiptId, transactionHash, config.cacheExpiry);
        }),
        receipts.map(async (receipt) => {
          const receiptOrDataId: string =
            'Data' in receipt.receipt
              ? receipt.receipt.Data.dataId
              : receipt.receiptId;

          const parentHash = await retry(async () => {
            return await redis.get(receiptOrDataId);
          });

          if (parentHash && 'Action' in receipt.receipt) {
            const dataIds = receipt.receipt.Action.outputDataReceivers.map(
              (receiver) => receiver.dataId,
            );

            await Promise.all(
              dataIds.map(async (dataId) => {
                await redis.set(dataId, parentHash, config.cacheExpiry);
              }),
            );
          }
        }),
        outcomes.map(async (outcome) => {
          const parentHash = await retry(async () => {
            return await redis.get(outcome.executionOutcome.id);
          });

          if (parentHash) {
            await Promise.all(
              outcome.executionOutcome.outcome.receiptIds.map(
                async (receiptId) => {
                  await redis.set(receiptId, parentHash, config.cacheExpiry);
                },
              ),
            );
          }
        }),
      ]);

      cacheSpan.setStatus({ code: SpanStatusCode.OK });
    });
  } catch (error) {
    cacheSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    cacheSpan.end();
  }
};
