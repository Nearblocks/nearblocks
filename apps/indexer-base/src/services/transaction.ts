import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Transaction } from 'nb-types';
import { retry } from 'nb-utils';

import { mapExecutionStatus } from '#libs/utils';

export const storeTransactions = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);

  await Promise.all(
    chunks.map(async (chunk) => {
      await storeChunkTransactions(
        knex,
        chunk.header.chunkHash,
        message.block.header.hash,
        message.block.header.timestampNanosec,
        chunk.transactions,
      );
    }),
  );
};

const storeChunkTransactions = async (
  knex: Knex,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  transactions: types.IndexerTransactionWithOutcome[],
) => {
  const data = transactions.map((tx, index) =>
    getTransactionData(tx, chunkHash, blockHash, blockTimestamp, index),
  );

  if (data.length) {
    await retry(async () => {
      await knex('transactions')
        .insert(data)
        .onConflict(['transaction_hash'])
        .ignore();
    });
  }
};

const getTransactionData = (
  tx: types.IndexerTransactionWithOutcome,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  indexInChunk: number,
): Transaction => ({
  block_timestamp: blockTimestamp,
  converted_into_receipt_id: tx.outcome.executionOutcome.outcome.receiptIds[0],
  included_in_block_hash: blockHash,
  included_in_chunk_hash: chunkHash,
  index_in_chunk: indexInChunk,
  receipt_conversion_gas_burnt: tx.outcome.executionOutcome.outcome.gasBurnt,
  receipt_conversion_tokens_burnt:
    tx.outcome.executionOutcome.outcome.tokensBurnt,
  receiver_account_id: tx.transaction.receiverId,
  signer_account_id: tx.transaction.signerId,
  status: mapExecutionStatus(tx.outcome.executionOutcome.outcome.status),
  transaction_hash: tx.transaction.hash,
});
