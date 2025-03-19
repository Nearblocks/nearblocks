import { Message } from 'nb-blocks';
import { retry } from 'nb-utils';

import { lru } from '#libs/lru';

export const prepareCache = async (message: Message) => {
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);
  const txns = chunks
    .flatMap((chunk) => chunk.transactions)
    .map((txn) => {
      const transactionHash = txn.transaction.hash;
      const receiptId = txn.outcome.executionOutcome.outcome.receiptIds[0];

      return lru.set(receiptId, transactionHash);
    });
  const receipts = chunks
    .flatMap((chunk) => chunk.receipts)
    .map(async (receipt) => {
      const receiptOrDataId: string =
        'Data' in receipt.receipt
          ? receipt.receipt.Data.dataId
          : receipt.receiptId;

      const parentHash = await retry(async () => {
        return lru.peek(receiptOrDataId);
      });

      if (parentHash && 'Action' in receipt.receipt) {
        const inputs = receipt.receipt.Action.inputDataIds.map((dataId) =>
          lru.set(dataId, parentHash),
        );

        const outputs = receipt.receipt.Action.outputDataReceivers.map(
          (receiver) => lru.set(receiver.dataId, parentHash),
        );

        return Promise.all([...inputs, ...outputs]);
      }

      return;
    });
  const outcomes = message.shards
    .flatMap((shard) => shard.receiptExecutionOutcomes)
    .map(async (outcome) => {
      const parentHash = await retry(async () => {
        return lru.peek(outcome.executionOutcome.id);
      });

      if (parentHash) {
        return Promise.all(
          outcome.executionOutcome.outcome.receiptIds.map(async (receiptId) => {
            return lru.set(receiptId, parentHash);
          }),
        );
      }

      return;
    });

  await Promise.all([...txns, ...receipts, ...outcomes]);
};
