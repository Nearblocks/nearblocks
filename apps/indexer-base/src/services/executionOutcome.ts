import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';
import { retry } from 'nb-utils';

import { jsonStringify, mapExecutionStatus } from '#libs/utils';

const outcomeTracer = trace.getTracer('execution-outcomes-processor');

export const storeExecutionOutcomes = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const span = outcomeTracer.startSpan('store.execution_outcomes', {
    attributes: {
      'block.hash': message.block.header.hash,
      'block.height': message.block.header.height,
      'block.timestamp': message.block.header.timestampNanosec,
    },
  });

  try {
    await context.with(trace.setSpan(context.active(), span), async () => {
      await Promise.all(
        message.shards.map(async (shard) => {
          const shardSpan = outcomeTracer.startSpan(
            'process.shard.execution_outcomes',
            {
              attributes: {
                'execution_outcomes.count':
                  shard.receiptExecutionOutcomes.length,
                'shard.id': shard.shardId,
              },
            },
          );

          try {
            await storeChunkExecutionOutcomes(
              knex,
              shard.shardId,
              message.block.header.timestampNanosec,
              shard.receiptExecutionOutcomes,
            );
            shardSpan.setStatus({ code: SpanStatusCode.OK });
          } catch (error) {
            shardSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
          } finally {
            shardSpan.end();
          }
        }),
      );
      span.setStatus({ code: SpanStatusCode.OK });
    });
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

export const storeChunkExecutionOutcomes = async (
  knex: Knex,
  shardId: number,
  blockTimestamp: string,
  executionOutcomes: types.ExecutionOutcomeWithReceipt[],
) => {
  const outcomes: ExecutionOutcome[] = [];
  const outcomeReceipts: ExecutionOutcomeReceipt[] = [];

  executionOutcomes.forEach((executionOutcome, indexInChunk) => {
    outcomes.push(
      getExecutionOutcomeData(
        shardId,
        blockTimestamp,
        indexInChunk,
        executionOutcome,
      ),
    );

    const executionOutcomeReceipts =
      executionOutcome.executionOutcome.outcome.receiptIds.map(
        (receiptId, receiptIndex) =>
          getExecutionOutcomeReceiptData(
            executionOutcome.executionOutcome.id,
            receiptId,
            receiptIndex,
          ),
      );

    outcomeReceipts.push(...executionOutcomeReceipts);
  });

  const promises = [];

  if (outcomes.length) {
    promises.push(
      retry(async () => {
        await knex('execution_outcomes')
          .insert(outcomes)
          .onConflict(['receipt_id'])
          .ignore();
      }),
    );
  }

  if (outcomeReceipts.length) {
    promises.push(
      retry(async () => {
        await knex('execution_outcome_receipts')
          .insert(outcomeReceipts)
          .onConflict([
            'executed_receipt_id',
            'index_in_execution_outcome',
            'produced_receipt_id',
          ])
          .ignore();
      }),
    );
  }

  await Promise.all(promises);
};

const getExecutionOutcomeData = (
  shardId: number,
  blockTimestamp: string,
  indexInChunk: number,
  outcome: types.ExecutionOutcomeWithReceipt,
): ExecutionOutcome => ({
  executed_in_block_hash: outcome.executionOutcome.blockHash,
  executed_in_block_timestamp: blockTimestamp,
  executor_account_id: outcome.executionOutcome.outcome.executorId,
  gas_burnt: outcome.executionOutcome.outcome.gasBurnt,
  index_in_chunk: indexInChunk,
  logs: jsonStringify(outcome.executionOutcome.outcome.logs),
  receipt_id: outcome.executionOutcome.id,
  shard_id: shardId,
  status: mapExecutionStatus(outcome.executionOutcome.outcome.status),
  tokens_burnt: outcome.executionOutcome.outcome.tokensBurnt,
});

const getExecutionOutcomeReceiptData = (
  executedReceipt: string,
  producedReceipt: string,
  receiptIndex: number,
): ExecutionOutcomeReceipt => ({
  executed_receipt_id: executedReceipt,
  index_in_execution_outcome: receiptIndex,
  produced_receipt_id: producedReceipt,
});
