import { Action, Receipt as JReceipt, Message } from 'nb-blocks';
import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { ActionReceiptAction } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isDelegateAction } from '#libs/guards';
import { lru } from '#libs/lru';
import { difference, mapActionKind } from '#libs/utils';

const batchSize = config.insertLimit;
const receiptKinds = ['Action', 'Data']; // Skip GlobalContractDistribution (missing parent txn)

export const storeReceipts = async (knex: Knex, messages: Message[]) => {
  let receiptActionsData: ActionReceiptAction[] = [];
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
          shardChunk.header.hash,
          shardChunk.header.timestampNanosec,
          shardChunk.chunk.receipts.filter((receipt) =>
            receiptKinds.includes(Object.keys(receipt.receipt)[0]),
          ),
        );

        receiptActionsData = receiptActionsData.concat(
          receipts.receiptActionsData,
        );
      }
    }),
  );

  const promises = [];

  if (receiptActionsData.length) {
    for (let i = 0; i < receiptActionsData.length; i += batchSize) {
      const batch = receiptActionsData.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('action_receipt_actions')
            .insert(batch)
            .onConflict(['receipt_id', 'index_in_action_receipt'])
            .merge();
        }),
      );
    }
  }

  await Promise.all(promises);
};

const storeChunkReceipts = async (
  knex: Knex,
  blockHash: string,
  blockTimestamp: string,
  receipts: JReceipt[],
) => {
  const receiptOrDataIds = receipts.map((receipt) =>
    'Data' in receipt.receipt ? receipt.receipt.Data.dataId : receipt.receiptId,
  );
  const txnHashes = await getTxnHashes(knex, blockHash, receiptOrDataIds);

  const receiptActionsData: ActionReceiptAction[] = [];

  receipts.forEach((receipt) => {
    const receiptOrDataId: string =
      'Data' in receipt.receipt
        ? receipt.receipt.Data.dataId
        : receipt.receiptId;
    const txnHash = txnHashes.get(receiptOrDataId);

    if (!txnHash) {
      throw new Error(`no parent transaction for receipt: ${receiptOrDataId}`);
    }

    if ('Action' in receipt.receipt) {
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
  });

  return {
    receiptActionsData,
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
