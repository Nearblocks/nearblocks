import { difference, uniq } from 'lodash-es';
import { types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import {
  ActionReceiptAction,
  ActionReceiptInputData,
  ActionReceiptOutputData,
  Receipt,
} from 'nb-types';
import { retry } from 'nb-utils';

import { isDelegateAction } from '#libs/guards';
import {
  pgp,
  receiptActionsColumns,
  receiptColumns,
  receiptInputColumns,
  receiptOutputColumns,
} from '#libs/pgp';
import redis, { redisClient } from '#libs/redis';
import { mapActionKind, mapReceiptKind } from '#libs/utils';
import { PgpClient } from '#types/types';

export const storeReceipts = async (
  pool: PgpClient,
  message: types.StreamerMessage,
) => {
  let receiptData: Receipt[] = [];
  let receiptActionsData: ActionReceiptAction[] = [];
  let receiptInputData: ActionReceiptInputData[] = [];
  let receiptOutputData: ActionReceiptOutputData[] = [];
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);

  await Promise.all(
    chunks.map(async (chunk) => {
      if (chunk.receipts.length) {
        const receipts = await storeChunkReceipts(
          pool,
          chunk.header.chunkHash,
          message.block.header.hash,
          message.block.header.timestampNanosec,
          chunk.receipts,
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

  const queries = [];

  if (receiptData.length) {
    queries.push(
      pgp.helpers.insert(receiptData, receiptColumns) +
        ' ON CONFLICT (receipt_id) DO NOTHING',
    );
  }

  if (receiptActionsData.length) {
    queries.push(
      pgp.helpers.insert(receiptActionsData, receiptActionsColumns) +
        ' ON CONFLICT (receipt_id, index_in_action_receipt) DO NOTHING',
    );
  }

  if (receiptInputData.length) {
    queries.push(
      pgp.helpers.insert(receiptInputData, receiptInputColumns) +
        ' ON CONFLICT (input_data_id, input_to_receipt_id) DO NOTHING',
    );
  }

  if (receiptOutputData.length) {
    queries.push(
      pgp.helpers.insert(receiptOutputData, receiptOutputColumns) +
        ' ON CONFLICT (output_data_id, output_from_receipt_id) DO NOTHING',
    );
  }

  return queries;
};

const storeChunkReceipts = async (
  pool: PgpClient,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  receipts: types.Receipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(pool, blockHash, receiptOrDataIds);

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

const getTxnHashes = async (
  pool: PgpClient,
  blockHash: string,
  ids: string[],
) => {
  const receiptOrDataIds = uniq(ids);
  let txnHashes = await retry(async () => {
    return await fetchTxnHashesFromCache(receiptOrDataIds);
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  logger.warn(
    {
      block: blockHash,
      receiptOrDataIds: receiptOrDataIds,
      txnHashes: [...txnHashes.keys()],
    },
    'missing parent txn hash(es) in cache... checking in db...',
  );

  txnHashes = await retry(async () => {
    return await fetchTxnHashesFromDB(pool, receiptOrDataIds);
  });

  return txnHashes;
};

const fetchTxnHashesFromCache = async (receiptOrDataIds: string[]) => {
  const txnHashes: Map<string, string> = new Map();
  const hashes = await redisClient.mget(redis.prefixedKeys(receiptOrDataIds));

  hashes.forEach((hash, i) => {
    if (hash) txnHashes.set(receiptOrDataIds[i], hash);
  });

  return txnHashes;
};

const fetchTxnHashesFromDB = async (
  pool: PgpClient,
  receiptOrDataIds: string[],
) => {
  const txnHashes: Map<string, string> = new Map();
  const receiptInputs = await pool.any(
    `
      SELECT
        action_receipt_input_data.input_data_id,
        receipts.originated_from_transaction_hash
      FROM
        action_receipt_input_data
        INNER JOIN receipts ON action_receipt_input_data.input_to_receipt_id = receipts.receipt_id
      WHERE
        action_receipt_input_data.input_data_id = ANY($1)
    `,
    [receiptOrDataIds],
  );

  receiptInputs.forEach((outputReceipt) => {
    txnHashes.set(
      outputReceipt.input_data_id,
      outputReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const receiptOutputs = await pool.any(
    `
      SELECT
        action_receipt_output_data.output_data_id,
        receipts.originated_from_transaction_hash
      FROM
        action_receipt_output_data
        INNER JOIN receipts ON action_receipt_output_data.output_from_receipt_id = receipts.receipt_id
      WHERE
        action_receipt_output_data.output_data_id = ANY($1)
    `,
    [receiptOrDataIds],
  );

  receiptOutputs.forEach((outputReceipt) => {
    txnHashes.set(
      outputReceipt.output_data_id,
      outputReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const outcomeReceipts = await pool.any(
    `
      SELECT
        execution_outcome_receipts.produced_receipt_id,
        receipts.originated_from_transaction_hash
      FROM
        execution_outcome_receipts
        INNER JOIN receipts ON execution_outcome_receipts.executed_receipt_id = receipts.receipt_id
      WHERE
        execution_outcome_receipts.produced_receipt_id = ANY($1)
    `,
    [receiptOrDataIds],
  );

  outcomeReceipts.forEach((outcomeReceipt) => {
    txnHashes.set(
      outcomeReceipt.produced_receipt_id,
      outcomeReceipt.originated_from_transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const transactions = await pool.any(
    `
      SELECT
        converted_into_receipt_id,
        transaction_hash
      FROM
        transactions
      WHERE
        converted_into_receipt_id = ANY($1)
    `,
    [receiptOrDataIds],
  );

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
  action: types.Action,
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
  dataReceiver: types.DataReceiver,
): ActionReceiptOutputData => ({
  output_data_id: dataReceiver.dataId,
  output_from_receipt_id: receiptId,
  receiver_account_id: dataReceiver.receiverId,
});
