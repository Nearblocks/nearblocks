import { types } from 'near-lake-framework';

import { retry } from 'nb-utils';

import config from '#config';
import redis from '#libs/redis';

export const prepareCache = async (message: types.StreamerMessage) => {
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);
  const txns = chunks
    .flatMap((chunk) => chunk.transactions)
    .map((txn) => {
      const transactionHash = txn.transaction.hash;
      const receiptId = txn.outcome.executionOutcome.outcome.receiptIds[0];

      return redis.set(receiptId, transactionHash, config.cacheExpiry);
    });
  const receipts = chunks
    .flatMap((chunk) => chunk.receipts)
    .map(async (receipt) => {
      const receiptOrDataId: string =
        'Data' in receipt.receipt
          ? receipt.receipt.Data.dataId
          : receipt.receiptId;

      const parentHash = await retry(async () => {
        return redis.get(receiptOrDataId);
      });

      if (parentHash && 'Action' in receipt.receipt) {
        const inputs = receipt.receipt.Action.inputDataIds.map((dataId) =>
          redis.set(dataId, parentHash, config.cacheExpiry),
        );

        const outputs = receipt.receipt.Action.outputDataReceivers.map(
          (receiver) =>
            redis.set(receiver.dataId, parentHash, config.cacheExpiry),
        );

        return Promise.all([...inputs, ...outputs]);
      }

      return;
    });
  const outcomes = message.shards
    .flatMap((shard) => shard.receiptExecutionOutcomes)
    .map(async (outcome) => {
      const parentHash = await retry(async () => {
        return redis.get(outcome.executionOutcome.id);
      });

      if (parentHash) {
        return Promise.all(
          outcome.executionOutcome.outcome.receiptIds.map(async (receiptId) => {
            return redis.set(receiptId, parentHash, config.cacheExpiry);
          }),
        );
      }

      return;
    });

  await Promise.all([...txns, ...receipts, ...outcomes]);
};
