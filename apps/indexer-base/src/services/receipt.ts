import { difference, uniq } from 'lodash-es';
import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import {
  AccountReceipt,
  ActionKind,
  ActionReceiptAction,
  ActionReceiptInputData,
  ActionReceiptOutputData,
  BlockReceipt,
  Receipt,
  TransactionReceipt,
} from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isDelegateAction } from '#libs/guards';
import redis, { redisClient } from '#libs/redis';
import { getBlockIndex, mapActionKind, mapReceiptKind } from '#libs/utils';

const batchSize = config.insertLimit;

export const storeReceipts = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  let blockReceipts: BlockReceipt[] = [];
  let txnReceipts: TransactionReceipt[] = [];
  let accountReceipts: AccountReceipt[] = [];
  let receiptData: Receipt[] = [];
  let receiptActionsData: ActionReceiptAction[] = [];
  let receiptInputData: ActionReceiptInputData[] = [];
  let receiptOutputData: ActionReceiptOutputData[] = [];
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);

  await Promise.all(
    chunks.map(async (chunk) => {
      if (chunk.receipts.length) {
        const receipts = await storeChunkReceipts(
          knex,
          chunk.header.shardId,
          chunk.header.chunkHash,
          message.block.header.height,
          message.block.header.timestampNanosec,
          chunk.receipts,
        );

        blockReceipts = blockReceipts.concat(receipts.blockReceipts);
        txnReceipts = txnReceipts.concat(receipts.txnReceipts);
        accountReceipts = accountReceipts.concat(receipts.accountReceipts);
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

  if (blockReceipts.length) {
    for (let i = 0; i < blockReceipts.length; i += batchSize) {
      const batch = blockReceipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('block_receipts')
            .insert(batch)
            .onConflict(['receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (txnReceipts.length) {
    for (let i = 0; i < txnReceipts.length; i += batchSize) {
      const batch = txnReceipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('transaction_receipts')
            .insert(batch)
            .onConflict(['transaction_hash', 'receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (accountReceipts.length) {
    for (let i = 0; i < accountReceipts.length; i += batchSize) {
      const batch = accountReceipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('account_receipts')
            .insert(batch)
            .onConflict(['account_id', 'receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (receiptData.length) {
    for (let i = 0; i < receiptData.length; i += batchSize) {
      const batch = receiptData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('receipts')
            .insert(batch)
            .onConflict(['block_height', 'receipt_id'])
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
            .onConflict([
              'block_height',
              'receipt_id',
              'index_in_action_receipt',
            ])
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
};

const storeChunkReceipts = async (
  knex: Knex,
  shardId: number,
  chunkHash: string,
  blockHeight: number,
  blockTimestamp: string,
  receipts: types.Receipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(knex, blockHeight, receiptOrDataIds);

  const blockReceipts: BlockReceipt[] = [];
  const txnReceipts: TransactionReceipt[] = [];
  const accountReceipts: AccountReceipt[] = [];
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

    blockReceipts.push({
      block_height: blockHeight,
      receipt_id: receipt.receiptId,
    });
    txnReceipts.push({
      block_height: blockHeight,
      receipt_id: receipt.receiptId,
      transaction_hash: txnHash,
    });

    let publicKey = null;
    const kinds: string[] = [];
    const methods: string[] = [];

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
        const { args, kind, method, rlpHash } = mapActionKind(action);

        kinds.push(kind);

        if (method) {
          methods.push(method);
        }

        if (isDelegateAction(action)) {
          receiptActionsData.push(
            getActionReceiptActionData(
              blockHeight,
              blockTimestamp,
              receiptOrDataId,
              actionIndex,
              receipt.predecessorId,
              receipt.receiverId,
              args,
              kind,
              rlpHash,
            ),
          );
          actionIndex += 1;

          action.Delegate.delegateAction.actions.forEach((action) => {
            const { args, kind, method, rlpHash } = mapActionKind(action);

            kinds.push(kind);

            if (method) {
              methods.push(method);
            }

            receiptActionsData.push(
              getActionReceiptActionData(
                blockHeight,
                blockTimestamp,
                receiptOrDataId,
                actionIndex,
                receipt.predecessorId,
                receipt.receiverId,
                args,
                kind,
                rlpHash,
              ),
            );
            actionIndex += 1;
          });

          return;
        }

        receiptActionsData.push(
          getActionReceiptActionData(
            blockHeight,
            blockTimestamp,
            receiptOrDataId,
            actionIndex,
            receipt.predecessorId,
            receipt.receiverId,
            args,
            kind,
            rlpHash,
          ),
        );
        actionIndex += 1;
      });
    }

    accountReceipts.push(
      getAccountReceiptData(
        blockHeight,
        blockTimestamp,
        txnHash,
        receipt,
        true,
        getBlockIndex(shardId, receiptIndex),
        JSON.stringify(methods),
        JSON.stringify(kinds),
      ),
    );
    receiptData.push(
      getReceiptData(
        receipt,
        chunkHash,
        blockHeight,
        blockTimestamp,
        txnHash,
        getBlockIndex(shardId, receiptIndex),
        publicKey,
      ),
    );
  });

  return {
    accountReceipts,
    blockReceipts,
    receiptActionsData,
    receiptData,
    receiptInputData,
    receiptOutputData,
    txnReceipts,
  };
};

const getTxnHashes = async (knex: Knex, blockHeight: number, ids: string[]) => {
  const receiptOrDataIds = uniq(ids);
  let txnHashes = await retry(async () => {
    return await fetchTxnHashesFromCache(receiptOrDataIds);
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  logger.warn(
    {
      block: blockHeight,
      receiptOrDataIds: receiptOrDataIds,
      txnHashes: [...txnHashes.keys()],
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
  const hashes = await redisClient.mget(redis.prefixedKeys(receiptOrDataIds));

  hashes.forEach((hash, i) => {
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
    .select('input_data_id', 'transaction_hash');

  receiptInputs.forEach((outputReceipt) => {
    txnHashes.set(outputReceipt.input_data_id, outputReceipt.transaction_hash);
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
    .select('output_data_id', 'transaction_hash');

  receiptOutputs.forEach((outputReceipt) => {
    txnHashes.set(outputReceipt.output_data_id, outputReceipt.transaction_hash);
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
    .select('produced_receipt_id', 'transaction_hash');

  outcomeReceipts.forEach((outcomeReceipt) => {
    txnHashes.set(
      outcomeReceipt.produced_receipt_id,
      outcomeReceipt.transaction_hash,
    );
  });

  if (txnHashes.size === receiptOrDataIds.length) {
    return txnHashes;
  }

  const transactions = await knex('transactions')
    .whereIn('receipt_id', receiptOrDataIds)
    .select('receipt_id', 'transaction_hash');

  transactions.forEach((transaction) => {
    txnHashes.set(transaction.receipt_id, transaction.transaction_hash);
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

const getAccountReceiptData = (
  blockHeight: number,
  blockTimestamp: string,
  txnHash: string,
  receipt: types.Receipt,
  isFrom: boolean,
  indexInBlock: number,
  methods: string,
  actions: string,
): AccountReceipt => ({
  account_id: isFrom ? receipt.predecessorId : receipt.receiverId,
  actions,
  block_height: blockHeight,
  block_timestamp: blockTimestamp,
  index_in_block: indexInBlock,
  involved_account_id: isFrom ? receipt.receiverId : receipt.predecessorId,
  is_from: isFrom,
  methods,
  receipt_id: receipt.receiptId,
  transaction_hash: txnHash,
});

const getReceiptData = (
  receipt: types.Receipt,
  chunkHash: string,
  blockHeight: number,
  blockTimestamp: string,
  transactionHash: string,
  indexInBlock: number,
  publicKey: null | string,
): Receipt => ({
  block_height: blockHeight,
  block_timestamp: blockTimestamp,
  chunk_hash: chunkHash,
  index_in_block: indexInBlock,
  predecessor_account_id: receipt.predecessorId,
  public_key: publicKey,
  receipt_id: receipt.receiptId,
  receipt_kind: mapReceiptKind(receipt.receipt),
  receiver_account_id: receipt.receiverId,
  transaction_hash: transactionHash,
});

const getActionReceiptActionData = (
  blockHeight: number,
  blockTimestamp: string,
  receiptId: string,
  actionIndex: number,
  predecessorId: string,
  receiverId: string,
  args: string,
  kind: ActionKind,
  rlpHash: null | string,
): ActionReceiptAction => {
  return {
    action_kind: kind,
    args,
    block_height: blockHeight,
    block_timestamp: blockTimestamp,
    index_in_action_receipt: actionIndex,
    nep518_rlp_hash: rlpHash,
    predecessor_account_id: predecessorId,
    receipt_id: receiptId,
    receiver_account_id: receiverId,
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
