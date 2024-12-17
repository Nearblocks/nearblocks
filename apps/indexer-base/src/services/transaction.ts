import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Transaction } from 'nb-types';
import { retry } from 'nb-utils';

import { mapExecutionStatus } from '#libs/utils';

const txnTracer = trace.getTracer('transaction-processor');

export const storeTransactions = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const span = txnTracer.startSpan('store.transactions', {
    attributes: {
      'block.hash': message.block.header.hash,
      'block.height': message.block.header.height,
      'block.timestamp': message.block.header.timestampNanosec,
    },
  });

  try {
    return await context.with(
      trace.setSpan(context.active(), span),
      async () => {
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
          await retry(async () => {
            const batchSize = 1000;

            for (let i = 0; i < transactions.length; i += batchSize) {
              span.addEvent('start.batch', {
                'batch.size': Math.min(batchSize, transactions.length - i),
                'batch.start': i,
              });

              try {
                const batch = transactions.slice(i, i + batchSize);
                span.setAttribute('transactions.count', batch.length);

                await knex('transactions')
                  .insert(batch)
                  .onConflict(['transaction_hash'])
                  .ignore();

                span.addEvent('end.batch', { 'batch.size': batch.length });
              } catch (error) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message:
                    error instanceof Error ? error.message : 'Unknown error',
                });
                throw error;
              }
            }
          });
        }

        span.setStatus({ code: SpanStatusCode.OK });
      },
    );
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    span.end();
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
