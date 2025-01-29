import { difference, uniq } from 'lodash-es';
import { types } from 'near-lake-framework';
import { PoolClient } from 'pg';

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
import redis, { redisClient } from '#libs/redis';
import { mapActionKind, mapReceiptKind } from '#libs/utils';

type ReceiptColumns = {
  [K in keyof Receipt]: Receipt[K][];
};
type ActionReceiptColumns = {
  [K in keyof ActionReceiptAction]: ActionReceiptAction[K][];
};
type ReceiptInputColumns = {
  [K in keyof ActionReceiptInputData]: ActionReceiptInputData[K][];
};
type ReceiptOutputColumns = {
  [K in keyof ActionReceiptOutputData]: ActionReceiptOutputData[K][];
};

const batchSize = config.insertLimit;

export const storeReceipts = async (
  pg: PoolClient,
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
          pg,
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

  const promises = [];

  if (receiptData.length) {
    for (let i = 0; i < receiptData.length; i += batchSize) {
      const batch = receiptData.slice(i, i + batchSize);
      const columns: ReceiptColumns = {
        included_in_block_hash: [],
        included_in_block_timestamp: [],
        included_in_chunk_hash: [],
        index_in_chunk: [],
        originated_from_transaction_hash: [],
        predecessor_account_id: [],
        public_key: [],
        receipt_id: [],
        receipt_kind: [],
        receiver_account_id: [],
      };

      batch.forEach((receipt) => {
        columns.included_in_block_hash.push(receipt.included_in_block_hash),
          columns.included_in_block_timestamp.push(
            receipt.included_in_block_timestamp,
          ),
          columns.included_in_chunk_hash.push(receipt.included_in_chunk_hash),
          columns.index_in_chunk.push(receipt.index_in_chunk),
          columns.originated_from_transaction_hash.push(
            receipt.originated_from_transaction_hash,
          ),
          columns.predecessor_account_id.push(receipt.predecessor_account_id),
          columns.public_key.push(receipt.public_key),
          columns.receipt_id.push(receipt.receipt_id),
          columns.receipt_kind.push(receipt.receipt_kind),
          columns.receiver_account_id.push(receipt.receiver_account_id);
      });

      promises.push(
        pg.query({
          name: 'insert_receipts',
          text: `
            INSERT INTO
              receipts (
                included_in_block_hash,
                included_in_block_timestamp,
                included_in_chunk_hash,
                index_in_chunk,
                originated_from_transaction_hash,
                predecessor_account_id,
                public_key,
                receipt_id,
                receipt_kind,
                receiver_account_id
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::TEXT[],
                $2::BIGINT[],
                $3::TEXT[],
                $4::INTEGER[],
                $5::TEXT[],
                $6::TEXT[],
                $7::TEXT[],
                $8::TEXT[],
                $9::receipt_kind[],
                $10::TEXT[]
              )
            ON CONFLICT (receipt_id) DO NOTHING
          `,
          values: [
            columns.included_in_block_hash,
            columns.included_in_block_timestamp,
            columns.included_in_chunk_hash,
            columns.index_in_chunk,
            columns.originated_from_transaction_hash,
            columns.predecessor_account_id,
            columns.public_key,
            columns.receipt_id,
            columns.receipt_kind,
            columns.receiver_account_id,
          ],
        }),
      );
    }
  }

  if (receiptActionsData.length) {
    for (let i = 0; i < receiptActionsData.length; i += batchSize) {
      const batch = receiptActionsData.slice(i, i + batchSize);
      const columns: ActionReceiptColumns = {
        action_kind: [],
        args: [],
        index_in_action_receipt: [],
        nep518_rlp_hash: [],
        receipt_id: [],
        receipt_included_in_block_timestamp: [],
        receipt_predecessor_account_id: [],
        receipt_receiver_account_id: [],
      };

      batch.forEach((receipt) => {
        columns.action_kind.push(receipt.action_kind),
          columns.args.push(receipt.args),
          columns.index_in_action_receipt.push(receipt.index_in_action_receipt),
          columns.nep518_rlp_hash.push(receipt.nep518_rlp_hash),
          columns.receipt_id.push(receipt.receipt_id),
          columns.receipt_included_in_block_timestamp.push(
            receipt.receipt_included_in_block_timestamp,
          ),
          columns.receipt_predecessor_account_id.push(
            receipt.receipt_predecessor_account_id,
          ),
          columns.receipt_receiver_account_id.push(
            receipt.receipt_receiver_account_id,
          );
      });

      promises.push(
        pg.query({
          name: 'insert_action_receipt_actions',
          text: `
            INSERT INTO
              action_receipt_actions (
                action_kind,
                args,
                index_in_action_receipt,
                nep518_rlp_hash,
                receipt_id,
                receipt_included_in_block_timestamp,
                receipt_predecessor_account_id,
                receipt_receiver_account_id
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::action_kind[],
                $2::JSONB[],
                $3::INTEGER[],
                $4::TEXT[],
                $5::TEXT[],
                $6::BIGINT[],
                $7::TEXT[],
                $8::TEXT[]
              )
            ON CONFLICT (receipt_id, index_in_action_receipt) DO NOTHING
          `,
          values: [
            columns.action_kind,
            columns.args,
            columns.index_in_action_receipt,
            columns.nep518_rlp_hash,
            columns.receipt_id,
            columns.receipt_included_in_block_timestamp,
            columns.receipt_predecessor_account_id,
            columns.receipt_receiver_account_id,
          ],
        }),
      );
    }
  }

  if (receiptInputData.length) {
    for (let i = 0; i < receiptInputData.length; i += batchSize) {
      const batch = receiptInputData.slice(i, i + batchSize);
      const columns: ReceiptInputColumns = {
        input_data_id: [],
        input_to_receipt_id: [],
      };

      batch.forEach((receipt) => {
        columns.input_data_id.push(receipt.input_data_id);
        columns.input_to_receipt_id.push(receipt.input_to_receipt_id);
      });

      promises.push(
        pg.query({
          name: 'insert_action_receipt_input_data',
          text: `
            INSERT INTO
              action_receipt_input_data (
                input_data_id,
                input_to_receipt_id
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::TEXT[],
                $2::TEXT[]
              )
            ON CONFLICT (input_data_id, input_to_receipt_id) DO NOTHING
          `,
          values: [columns.input_data_id, columns.input_to_receipt_id],
        }),
      );
    }
  }

  if (receiptOutputData.length) {
    for (let i = 0; i < receiptOutputData.length; i += batchSize) {
      const batch = receiptOutputData.slice(i, i + batchSize);
      const columns: ReceiptOutputColumns = {
        output_data_id: [],
        output_from_receipt_id: [],
        receiver_account_id: [],
      };

      batch.forEach((receipt) => {
        columns.output_data_id.push(receipt.output_data_id);
        columns.output_from_receipt_id.push(receipt.output_from_receipt_id);
        columns.receiver_account_id.push(receipt.receiver_account_id);
      });

      promises.push(
        pg.query({
          name: 'insert_action_receipt_output_data',
          text: `
            INSERT INTO
              action_receipt_output_data (
                output_data_id,
                output_from_receipt_id,
                receiver_account_id
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::TEXT[],
                $2::TEXT[],
                $3::TEXT[]
              )
            ON CONFLICT (output_data_id, output_from_receipt_id) DO NOTHING
          `,
          values: [
            columns.output_data_id,
            columns.output_from_receipt_id,
            columns.receiver_account_id,
          ],
        }),
      );
    }
  }

  await Promise.all(promises);
};

const storeChunkReceipts = async (
  pg: PoolClient,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  receipts: types.Receipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(pg, blockHash, receiptOrDataIds);

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
  pg: PoolClient,
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
    return await fetchTxnHashesFromDB(pg, receiptOrDataIds);
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
  pg: PoolClient,
  receiptOrDataIds: string[],
) => {
  const txnHashes: Map<string, string> = new Map();
  const { rows: receiptInputs } = await pg.query(
    `
      SELECT
        action_receipt_input_data.input_data_id,
        receipts.originated_from_transaction_hash
      FROM
        action_receipt_input_data
        INNER JOIN receipts ON action_receipt_input_data.input_to_receipt_id = receipts.receipt_id
      WHERE
        action_receipt_input_data.input_data_id = ANY ($1)
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

  const { rows: receiptOutputs } = await pg.query(
    `
      SELECT
        action_receipt_output_data.output_data_id,
        receipts.originated_from_transaction_hash
      FROM
        action_receipt_output_data
        INNER JOIN receipts ON action_receipt_output_data.output_from_receipt_id = receipts.receipt_id
      WHERE
        action_receipt_output_data.output_data_id = ANY ($1)
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

  const { rows: outcomeReceipts } = await pg.query(
    `
      SELECT
        execution_outcome_receipts.produced_receipt_id,
        receipts.originated_from_transaction_hash
      FROM
        execution_outcome_receipts
        INNER JOIN receipts ON execution_outcome_receipts.executed_receipt_id = receipts.receipt_id
      WHERE
        execution_outcome_receipts.produced_receipt_id = ANY ($1)
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

  const { rows: transactions } = await pg.query(
    `
      SELECT
        converted_into_receipt_id,
        transaction_hash
      FROM
        transactions
      WHERE
        converted_into_receipt_id = ANY ($1)
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
