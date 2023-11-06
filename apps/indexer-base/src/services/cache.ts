import { types } from 'near-lake-framework';

import { retry } from 'nb-utils';

import config from '#config';
import { redis, redisClient } from '#libs/redis';

export const prepareCache = async (message: types.StreamerMessage) => {
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

      await redisClient.set(redis.getPrefixedKeys(receiptId), transactionHash, {
        EX: config.cacheExpiry,
      });
    }),
    receipts.map(async (receipt) => {
      const receiptOrDataId: string =
        'Data' in receipt.receipt
          ? receipt.receipt.Data.dataId
          : receipt.receiptId;

      const parentHash = await retry(async () => {
        return await redisClient.get(redis.getPrefixedKeys(receiptOrDataId));
      });

      if (parentHash && 'Action' in receipt.receipt) {
        const dataIds = receipt.receipt.Action.outputDataReceivers.map(
          (receiver) => receiver.dataId,
        );

        await Promise.all(
          dataIds.map(async (dataId) => {
            await redisClient.set(redis.getPrefixedKeys(dataId), parentHash, {
              EX: config.cacheExpiry,
            });
          }),
        );
      }
    }),
    outcomes.map(async (outcome) => {
      const parentHash = await retry(async () => {
        return await redisClient.get(
          redis.getPrefixedKeys(outcome.executionOutcome.id),
        );
      });

      if (parentHash) {
        await Promise.all(
          outcome.executionOutcome.outcome.receiptIds.map(async (receiptId) => {
            await redisClient.set(
              redis.getPrefixedKeys(receiptId),
              parentHash,
              {
                EX: config.cacheExpiry,
              },
            );
          }),
        );
      }
    }),
  ]);
};
