import { Action, DataReceiver, Receipt as JReceipt, Message } from 'nb-blocks';
import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import {
  ActionReceiptAction,
  ActionReceiptInputData,
  ActionReceiptOutputData,
  Receipt,
} from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isDelegateAction } from '#libs/guards';
import { lru } from '#libs/lru';
import { receiptHistogram } from '#libs/prom';
import { difference, mapActionKind, mapReceiptKind } from '#libs/utils';

const batchSize = config.insertLimit;
const receiptKinds = ['Action', 'Data'];

export const storeReceipts = async (knex: Knex, messages: Message[]) => {
  const start = performance.now();
  let receiptData: Receipt[] = [];
  let receiptActionsData: ActionReceiptAction[] = [];
  let receiptInputData: ActionReceiptInputData[] = [];
  let receiptOutputData: ActionReceiptOutputData[] = [];
  const shardChunks = messages.flatMap((message) =>
    message.shards.flatMap((shard) => ({
      chunk: shard.chunk,
      header: message.block.header,
    })),
  );

  await Promise.all(
    shardChunks.map(async (shardChunk) => {
      if (shardChunk.chunk && shardChunk.chunk.receipts.length) {
        const receipts = await storeChunkReceipts(
          knex,
          shardChunk.chunk.header.chunkHash,
          shardChunk.header.hash,
          shardChunk.header.timestampNanosec,
          shardChunk.chunk.receipts.filter((receipt) =>
            receiptKinds.includes(Object.keys(receipt.receipt)[0]),
          ),
        );

        receiptData = receiptData.concat(receipts.receiptData);
        receiptActionsData = receiptActionsData.concat(
          receipts.receiptActionsData,
        );
        receiptInputData = receiptInputData.concat(receipts.receiptInputData);
        receiptOutputData = receiptOutputData.concat(
          receipts.receiptOutputData,
        );
      }
    }),
  );

  const promises = [];

  if (receiptData.length) {
    for (let i = 0; i < receiptData.length; i += batchSize) {
      const batch = receiptData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('receipts')
            .insert(batch)
            .onConflict(['receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (receiptActionsData.length) {
    for (let i = 0; i < receiptActionsData.length; i += batchSize) {
      const batch = receiptActionsData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('action_receipt_actions')
            .insert(batch)
            .onConflict(['receipt_id', 'index_in_action_receipt'])
            .ignore();
        }),
      );
    }
  }

  if (receiptInputData.length) {
    for (let i = 0; i < receiptInputData.length; i += batchSize) {
      const batch = receiptInputData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('action_receipt_input_data')
            .insert(batch)
            .onConflict(['input_data_id', 'input_to_receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (receiptOutputData.length) {
    for (let i = 0; i < receiptOutputData.length; i += batchSize) {
      const batch = receiptOutputData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('action_receipt_output_data')
            .insert(batch)
            .onConflict(['output_data_id', 'output_from_receipt_id'])
            .ignore();
        }),
      );
    }
  }

  await Promise.all(promises);
  receiptHistogram.labels(config.network).observe(performance.now() - start);
};

const storeChunkReceipts = async (
  knex: Knex,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  receipts: JReceipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(knex, blockHash, receiptOrDataIds);

  const receiptData: Receipt[] = [];
  const receiptActionsData: ActionReceiptAction[] = [];
  const receiptInputData: ActionReceiptInputData[] = [];
  const receiptOutputData: ActionReceiptOutputData[] = [];

  receipts.forEach((receipt, receiptIndex) => {
    const receiptOrDataId: string =
      'Data' in receipt.receipt
        ? receipt.receipt.Data.dataId
        : receipt.receiptId;
    const txnHash = txnHashes.get(receiptOrDataId);

    if (!txnHash) {
      throw new Error(`no parent transaction for receipt: ${receiptOrDataId}`);
    }

    let publicKey = null;

    if ('Action' in receipt.receipt) {
      publicKey = receipt.receipt.Action.signerPublicKey;

      receipt.receipt.Action.inputDataIds.forEach((dataId) => {
        receiptInputData.push(
          getActionReceiptInputData(receiptOrDataId, dataId),
        );
      });
      receipt.receipt.Action.outputDataReceivers.forEach((receiver) => {
        receiptOutputData.push(
          getActionReceiptOutputData(receiptOrDataId, receiver),
        );
      });

      let actionIndex = 0;
      receipt.receipt.Action.actions.forEach((action) => {
        if (isDelegateAction(action)) {
          receiptActionsData.push(
            getActionReceiptActionData(
              blockTimestamp,
              receiptOrDataId,
              actionIndex,
              action,
              receipt.predecessorId,
              receipt.receiverId,
            ),
          );
          actionIndex += 1;

          action.Delegate.delegateAction.actions.forEach((action) => {
            receiptActionsData.push(
              getActionReceiptActionData(
                blockTimestamp,
                receiptOrDataId,
                actionIndex,
                action,
                receipt.predecessorId,
                receipt.receiverId,
              ),
            );
            actionIndex += 1;
          });

          return;
        }

        receiptActionsData.push(
          getActionReceiptActionData(
            blockTimestamp,
            receiptOrDataId,
            actionIndex,
            action,
            receipt.predecessorId,
            receipt.receiverId,
          ),
        );
        actionIndex += 1;
      });
    }

    receiptData.push(
      getReceiptData(
        receipt,
        chunkHash,
        blockHash,
        blockTimestamp,
        txnHash,
        receiptIndex,
        publicKey,
      ),
    );
  });

  return {
    receiptActionsData,
    receiptData,
    receiptInputData,
    receiptOutputData,
  };
};

const getTxnHashes = async (knex: Knex, blockHash: string, ids: string[]) => {
  const receiptOrDataIds = [...new Set(ids)];
  let txnHashes = fetchTxnHashesFromCache(receiptOrDataIds);

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  logger.warn(
    { block: blockHash },
    'missing parent txn hash(es) in cache... checking in db...',
  );

  txnHashes = await retry(async () => {
    return await fetchTxnHashesFromDB(knex, receiptOrDataIds);
  });

  return txnHashes;
};

const fetchTxnHashesFromCache = (receiptOrDataIds: string[]) => {
  const txnHashes: Map<string, string> = new Map();

  receiptOrDataIds.forEach((receiptOrDataId, i) => {
    const hash = lru.peek(receiptOrDataId);

    if (hash) txnHashes.set(receiptOrDataIds[i], hash);
  });

  return txnHashes;
};

const fetchTxnHashesFromDB = async (knex: Knex, receiptOrDataIds: string[]) => {
  const txnHashes: Map<string, string> = new Map();
  const receiptInputs = await knex('action_receipt_input_data')
    .innerJoin(
      'receipts',
      'action_receipt_input_data.input_to_receipt_id',
      'receipts.receipt_id',
    )
    .whereIn('input_data_id', receiptOrDataIds)
    .select('input_data_id', 'originated_from_transaction_hash');

  receiptInputs.forEach((outputReceipt) => {
    txnHashes.set(
      outputReceipt.input_data_id,
      outputReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const receiptOutputs = await knex('action_receipt_output_data')
    .innerJoin(
      'receipts',
      'action_receipt_output_data.output_from_receipt_id',
      'receipts.receipt_id',
    )
    .whereIn('output_data_id', receiptOrDataIds)
    .select('output_data_id', 'originated_from_transaction_hash');

  receiptOutputs.forEach((outputReceipt) => {
    txnHashes.set(
      outputReceipt.output_data_id,
      outputReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const outcomeReceipts = await knex('execution_outcome_receipts')
    .innerJoin(
      'receipts',
      'execution_outcome_receipts.executed_receipt_id',
      'receipts.receipt_id',
    )
    .whereIn('produced_receipt_id', receiptOrDataIds)
    .select('produced_receipt_id', 'originated_from_transaction_hash');

  outcomeReceipts.forEach((outcomeReceipt) => {
    txnHashes.set(
      outcomeReceipt.produced_receipt_id,
      outcomeReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const transactions = await knex('transactions')
    .whereIn('converted_into_receipt_id', receiptOrDataIds)
    .select('converted_into_receipt_id', 'transaction_hash');

  transactions.forEach((transaction) => {
    txnHashes.set(
      transaction.converted_into_receipt_id,
      transaction.transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  throw new Error(
    `missing parent txn hash(es) in db...${JSON.stringify({
      outcomeReceipts,
      receiptInputs,
      receiptOrDataIds: difference(receiptOrDataIds, [...txnHashes.keys()]),
      receiptOutputs,
      transactions,
    })}`,
  );
};

const getReceiptData = (
  receipt: JReceipt,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  transactionHash: string,
  indexInChunk: number,
  publicKey: null | string,
): Receipt => ({
  included_in_block_hash: blockHash,
  included_in_block_timestamp: blockTimestamp,
  included_in_chunk_hash: chunkHash,
  index_in_chunk: indexInChunk,
  originated_from_transaction_hash: transactionHash,
  predecessor_account_id: receipt.predecessorId,
  public_key: publicKey,
  receipt_id: receipt.receiptId,
  receipt_kind: mapReceiptKind(receipt.receipt),
  receiver_account_id: receipt.receiverId,
});

const getActionReceiptActionData = (
  blockTimestamp: string,
  receiptId: string,
  actionIndex: number,
  action: Action,
  predecessorId: string,
  receiverId: string,
): ActionReceiptAction => {
  const { args, kind, rlpHash } = mapActionKind(action);

  return {
    action_kind: kind,
    args,
    index_in_action_receipt: actionIndex,
    nep518_rlp_hash: rlpHash,
    receipt_id: receiptId,
    receipt_included_in_block_timestamp: blockTimestamp,
    receipt_predecessor_account_id: predecessorId,
    receipt_receiver_account_id: receiverId,
  };
};

const getActionReceiptInputData = (
  receiptId: string,
  dataId: string,
): ActionReceiptInputData => ({
  input_data_id: dataId,
  input_to_receipt_id: receiptId,
});

const getActionReceiptOutputData = (
  receiptId: string,
  dataReceiver: DataReceiver,
): ActionReceiptOutputData => ({
  output_data_id: dataReceiver.dataId,
  output_from_receipt_id: receiptId,
  receiver_account_id: dataReceiver.receiverId,
});
