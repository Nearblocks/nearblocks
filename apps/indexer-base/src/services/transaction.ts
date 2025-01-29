import { types } from 'near-lake-framework';
import { PoolClient } from 'pg';

import { Transaction } from 'nb-types';

import config from '#config';
import { mapExecutionStatus } from '#libs/utils';

type TransactionColumns = {
  [K in keyof Transaction]: Transaction[K][];
};

const batchSize = config.insertLimit;

export const storeTransactions = async (
  pg: PoolClient,
  message: types.StreamerMessage,
) => {
  const chunks = message.shards.flatMap((shard) => shard.chunk || []);
  const transactions = chunks.flatMap((chunk) => {
    return chunk.transactions.map((txn, index) =>
      getTransactionData(
        txn,
        chunk.header.chunkHash,
        message.block.header.hash,
        message.block.header.timestampNanosec,
        index,
      ),
    );
  });

  if (transactions.length) {
    const promises = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const columns: TransactionColumns = {
        block_timestamp: [],
        converted_into_receipt_id: [],
        included_in_block_hash: [],
        included_in_chunk_hash: [],
        index_in_chunk: [],
        receipt_conversion_gas_burnt: [],
        receipt_conversion_tokens_burnt: [],
        receiver_account_id: [],
        signer_account_id: [],
        status: [],
        transaction_hash: [],
      };

      batch.forEach((transaction) => {
        columns.block_timestamp.push(transaction.block_timestamp);
        columns.converted_into_receipt_id.push(
          transaction.converted_into_receipt_id,
        );
        columns.included_in_block_hash.push(transaction.included_in_block_hash);
        columns.included_in_chunk_hash.push(transaction.included_in_chunk_hash);
        columns.index_in_chunk.push(transaction.index_in_chunk);
        columns.receipt_conversion_gas_burnt.push(
          transaction.receipt_conversion_gas_burnt,
        );
        columns.receipt_conversion_tokens_burnt.push(
          transaction.receipt_conversion_tokens_burnt,
        );
        columns.receiver_account_id.push(transaction.receiver_account_id);
        columns.signer_account_id.push(transaction.signer_account_id);
        columns.status.push(transaction.status);
        columns.transaction_hash.push(transaction.transaction_hash);
      });

      promises.push(
        pg.query({
          name: 'insert_transactions',
          text: `
            INSERT INTO
              transactions (
                block_timestamp,
                converted_into_receipt_id,
                included_in_block_hash,
                included_in_chunk_hash,
                index_in_chunk,
                receipt_conversion_gas_burnt,
                receipt_conversion_tokens_burnt,
                receiver_account_id,
                signer_account_id,
                status,
                transaction_hash
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::BIGINT[],
                $2::TEXT[],
                $3::TEXT[],
                $4::TEXT[],
                $5::INTEGER[],
                $6::NUMERIC[],
                $7::NUMERIC[],
                $8::TEXT[],
                $9::TEXT[],
                $10::execution_outcome_status[],
                $11::TEXT[]
              )
            ON CONFLICT (transaction_hash) DO NOTHING
          `,
          values: [
            columns.block_timestamp,
            columns.converted_into_receipt_id,
            columns.included_in_block_hash,
            columns.included_in_chunk_hash,
            columns.index_in_chunk,
            columns.receipt_conversion_gas_burnt,
            columns.receipt_conversion_tokens_burnt,
            columns.receiver_account_id,
            columns.signer_account_id,
            columns.status,
            columns.transaction_hash,
          ],
        }),
      );
    }

    await Promise.all(promises);
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
