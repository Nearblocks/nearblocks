import { Message } from 'nb-neardata';

import { lru } from '#libs/lru';

export const prepareCache = (message: Message) => {
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
      const parentHash =
        lru.peek(outcome.executionOutcome.id) ?? outcome.txHash;

      if (parentHash) {
        lru.set(outcome.executionOutcome.id, parentHash);
        outcome.executionOutcome.outcome.receiptIds.forEach((receiptId) =>
          lru.set(receiptId, parentHash),
        );

        if (outcome.receipt && 'Action' in outcome.receipt.receipt) {
          outcome.receipt.receipt.Action.inputDataIds.forEach((dataId) =>
            lru.set(dataId, parentHash),
          );
          outcome.receipt.receipt.Action.outputDataReceivers.forEach(
            (receiver) => lru.set(receiver.dataId, parentHash),
          );
        }
      }
    });
  });
};
