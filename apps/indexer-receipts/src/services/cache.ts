import { Message } from 'nb-blocks';

import { lru } from '#libs/lru';

export const prepareCache = (messages: Message[]) => {
  messages.forEach((message) => {
    message.shards.forEach((shard) => {
      shard.chunk?.transactions.forEach((txn) => {
        const txnHash = txn.transaction.hash;
        const receiptId = txn.outcome.executionOutcome.outcome.receiptIds[0];

        lru.set(receiptId, txnHash);
      });
      shard.chunk?.receipts.forEach((receipt) => {
        const receiptOrDataId: string =
          'Data' in receipt.receipt
            ? receipt.receipt.Data.dataId
            : receipt.receiptId;

        const parentHash = lru.peek(receiptOrDataId);

        if (parentHash && 'Action' in receipt.receipt) {
          receipt.receipt.Action.inputDataIds.forEach((dataId) =>
            lru.set(dataId, parentHash),
          );
          receipt.receipt.Action.outputDataReceivers.forEach((receiver) =>
            lru.set(receiver.dataId, parentHash),
          );
        }
      });
      shard.receiptExecutionOutcomes.forEach((outcome) => {
        const parentHash = lru.peek(outcome.executionOutcome.id);

        if (parentHash) {
          outcome.executionOutcome.outcome.receiptIds.forEach((receiptId) =>
            lru.set(receiptId, parentHash),
          );
        }
      });
    });
  });
};
