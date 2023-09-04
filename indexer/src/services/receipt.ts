import { Knex } from 'knex';
import { types } from 'near-lake-framework';
import { difference, uniq } from 'lodash-es';

import log from '#libs/log';
import redis from '#libs/redis';
import retry from '#libs/retry';
import { mapReceiptKind, mapActionKind } from '#libs/utils';
import {
  Receipt,
  ActionReceiptAction,
  ActionReceiptOutputData,
} from '#ts/types';

export const storeReceipts = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);

  await Promise.all(
    chunks.map(async (chunk) => {
      if (chunk.receipts.length) {
        await storeChunkReceipts(
          knex,
          chunk.header.chunkHash,
          message.block.header.hash,
          message.block.header.timestampNanosec,
          chunk.receipts,
        );
      }
    }),
  );
};

const storeChunkReceipts = async (
  knex: Knex,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  receipts: types.Receipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(knex, blockHash, receiptOrDataIds);

  const receiptData: Receipt[] = [];
  const receiptActionsData: ActionReceiptAction[] = [];
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

    if ('Action' in receipt.receipt) {
      receipt.receipt.Action.outputDataReceivers.forEach((receiver) => {
        receiptOutputData.push(
          getActionReceiptOutputData(receiptOrDataId, receiver),
        );
      });

      receipt.receipt.Action.actions.forEach((action, actionIndex) => {
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
      ),
    );
  });

  if (receiptData.length) {
    await retry(async () => {
      await knex('receipts')
        .insert(receiptData)
        .onConflict('receipt_id')
        .ignore();
    });
  }

  if (receiptActionsData.length) {
    await retry(async () => {
      await knex('action_receipt_actions')
        .insert(receiptActionsData)
        .onConflict(['receipt_id', 'index_in_action_receipt'])
        .ignore();
    });
  }

  if (receiptOutputData.length) {
    await retry(async () => {
      await knex('action_receipt_output_data')
        .insert(receiptOutputData)
        .onConflict(['output_data_id', 'output_from_receipt_id'])
        .ignore();
    });
  }
};

const getTxnHashes = async (knex: Knex, blockHash: string, ids: string[]) => {
  const receiptOrDataIds = uniq(ids);
  let txnHashes = await retry(async () => {
    return await fetchTxnHashesFromCache(receiptOrDataIds);
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  log.warn(
    {
      receiptOrDataIds: receiptOrDataIds,
      txnHashes: [...txnHashes.keys()],
      block: blockHash,
    },
    'missing parent txn hash(es) in cache... checking in db...',
  );

  txnHashes = await retry(async () => {
    return await fetchTxnHashesFromDB(knex, receiptOrDataIds);
  });

  return txnHashes;
};

const fetchTxnHashesFromCache = async (receiptOrDataIds: string[]) => {
  const txnHashes: Map<string, string> = new Map();
  const hashes = await redis.mGet(receiptOrDataIds);

  hashes.forEach((hash, i) => {
    if (hash) txnHashes.set(receiptOrDataIds[i], hash);
  });

  return txnHashes;
};

const fetchTxnHashesFromDB = async (knex: Knex, receiptOrDataIds: string[]) => {
  const txnHashes: Map<string, string> = new Map();
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
      receiptOrDataIds: difference(receiptOrDataIds, [...txnHashes.keys()]),
    })}`,
  );
};

const getReceiptData = (
  receipt: types.Receipt,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  transactionHash: string,
  indexInChunk: number,
): Receipt => ({
  receipt_id: receipt.receiptId,
  included_in_block_hash: blockHash,
  included_in_chunk_hash: chunkHash,
  predecessor_account_id: receipt.predecessorId,
  receiver_account_id: receipt.receiverId,
  receipt_kind: mapReceiptKind(receipt.receipt),
  originated_from_transaction_hash: transactionHash,
  index_in_chunk: indexInChunk,
  included_in_block_timestamp: blockTimestamp,
});

const getActionReceiptActionData = (
  blockTimestamp: string,
  receiptId: string,
  actionIndex: number,
  action: types.Action,
  predecessorId: string,
  receiverId: string,
): ActionReceiptAction => {
  const { args, kind } = mapActionKind(action);

  return {
    receipt_id: receiptId,
    index_in_action_receipt: actionIndex,
    args,
    action_kind: kind,
    receipt_predecessor_account_id: predecessorId,
    receipt_receiver_account_id: receiverId,
    receipt_included_in_block_timestamp: blockTimestamp,
  };
};

const getActionReceiptOutputData = (
  receiptId: string,
  dataReceiver: types.DataReceiver,
): ActionReceiptOutputData => ({
  output_from_receipt_id: receiptId,
  output_data_id: dataReceiver.dataId,
  receiver_account_id: dataReceiver.receiverId,
});
