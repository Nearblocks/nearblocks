import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { AccountTransaction, BlockTransaction, Transaction } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { getBlockIndex, mapExecutionStatus } from '#libs/utils';

const batchSize = config.insertLimit;

export const storeTransactions = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const blockTxns: BlockTransaction[] = [];
  const accountTxns: AccountTransaction[] = [];
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);
  const transactions = chunks.flatMap((chunk) => {
    return chunk.transactions.map((txn, index) => {
      blockTxns.push({
        block_height: message.block.header.height,
        transaction_hash: txn.transaction.hash,
      });
      accountTxns.push(
        getAccountTxnData(
          message.block.header.height,
          message.block.header.timestampNanosec,
          txn,
          true,
          getBlockIndex(chunk.header.shardId, index * 2 + 1),
        ),
      );
      accountTxns.push(
        getAccountTxnData(
          message.block.header.height,
          message.block.header.timestampNanosec,
          txn,
          false,
          getBlockIndex(chunk.header.shardId, index * 2 + 2),
        ),
      );
      return getTransactionData(
        txn,
        chunk.header.chunkHash,
        message.block.header.height,
        message.block.header.timestampNanosec,
        getBlockIndex(chunk.header.shardId, index),
      );
    });
  });

  const promises = [];

  if (blockTxns.length) {
    for (let i = 0; i < blockTxns.length; i += batchSize) {
      const batch = blockTxns.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('block_transactions')
            .insert(batch)
            .onConflict(['transaction_hash'])
            .ignore();
        }),
      );
    }
  }

  if (accountTxns.length) {
    for (let i = 0; i < accountTxns.length; i += batchSize) {
      const batch = accountTxns.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('account_transactions')
            .insert(batch)
            .onConflict(['account_id', 'transaction_hash'])
            .ignore();
        }),
      );
    }
  }

  if (transactions.length) {
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('transactions')
            .insert(batch)
            .onConflict(['block_height', 'transaction_hash'])
            .ignore();
        }),
      );
    }
  }

  await Promise.all(promises);
};

const getAccountTxnData = (
  blockHeight: number,
  blockTimestamp: string,
  tx: types.IndexerTransactionWithOutcome,
  isFrom: boolean,
  indexInBlock: number,
): AccountTransaction => ({
  account_id: isFrom ? tx.transaction.signerId : tx.transaction.receiverId,
  block_height: blockHeight,
  block_timestamp: blockTimestamp,
  index_in_block: indexInBlock,
  involved_account_id: isFrom
    ? tx.transaction.receiverId
    : tx.transaction.signerId,
  is_from: isFrom,
  transaction_hash: tx.transaction.hash,
});

const getTransactionData = (
  tx: types.IndexerTransactionWithOutcome,
  chunkHash: string,
  blockHeight: number,
  blockTimestamp: string,
  indexInBlock: number,
): Transaction => ({
  block_height: blockHeight,
  block_timestamp: blockTimestamp,
  chunk_hash: chunkHash,
  gas_burnt: tx.outcome.executionOutcome.outcome.gasBurnt,
  index_in_block: indexInBlock,
  receipt_id: tx.outcome.executionOutcome.outcome.receiptIds[0],
  receiver_account_id: tx.transaction.receiverId,
  signer_account_id: tx.transaction.signerId,
  status: mapExecutionStatus(tx.outcome.executionOutcome.outcome.status),
  tokens_burnt: tx.outcome.executionOutcome.outcome.tokensBurnt,
  transaction_hash: tx.transaction.hash,
});
