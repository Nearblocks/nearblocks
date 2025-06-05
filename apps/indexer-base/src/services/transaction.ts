import { Knex } from 'nb-knex';
import {
  BlockHeader,
  IndexerTransactionWithOutcome,
  Message,
} from 'nb-neardata';
import { Transaction } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { txnHistogram } from '#libs/prom';

const batchSize = config.insertLimit;

export const storeTransactions = async (knex: Knex, message: Message) => {
  const start = performance.now();
  const transactions: Transaction[] = [];

  for (const shard of message.shards) {
    if (shard.chunk) {
      const txnsCount = shard.chunk.transactions.length;

      for (let index = 0; index < txnsCount; index++) {
        const txn = shard.chunk.transactions[index];

        transactions.push(
          getTransactionData(
            txn,
            shard.shardId,
            shard.chunk.header.chunkHash,
            message.block.header,
            index,
          ),
        );
      }
    }
  }

  if (transactions.length) {
    const promises = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('transactions')
            .insert(batch)
            .onConflict(['transaction_hash', 'block_timestamp'])
            .ignore();
        }),
      );
    }

    await Promise.all(promises);
  }

  txnHistogram.labels(config.network).observe(performance.now() - start);
};

const getTransactionData = (
  txn: IndexerTransactionWithOutcome,
  shardId: number,
  chunkHash: string,
  blockHeader: BlockHeader,
  indexInChunk: number,
): Transaction => ({
  block_timestamp: blockHeader.timestampNanosec,
  converted_into_receipt_id: txn.outcome.executionOutcome.outcome.receiptIds[0],
  included_in_block_hash: blockHeader.hash,
  included_in_chunk_hash: chunkHash,
  index_in_chunk: indexInChunk,
  receipt_conversion_gas_burnt: txn.outcome.executionOutcome.outcome.gasBurnt,
  receipt_conversion_tokens_burnt:
    txn.outcome.executionOutcome.outcome.tokensBurnt,
  receiver_account_id: txn.transaction.receiverId,
  shard_id: shardId,
  signer_account_id: txn.transaction.signerId,
  transaction_hash: txn.transaction.hash,
});
