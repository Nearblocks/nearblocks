import { Knex } from 'nb-knex';
import { ExecutionOutcomeWithReceipt, Message } from 'nb-neardata';
import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { outcomeHistogram } from '#libs/prom';
import { jsonStringify, mapExecutionStatus } from '#libs/utils';

const batchSize = config.insertLimit;

export const storeExecutionOutcomes = async (knex: Knex, message: Message) => {
  const start = performance.now();
  let outcomes: ExecutionOutcome[] = [];
  let outcomeReceipts: ExecutionOutcomeReceipt[] = [];

  await Promise.all(
    message.shards.map(async (shard) => {
      const executions = storeChunkExecutionOutcomes(
        shard.shardId,
        message.block.header.timestampNanosec,
        shard.receiptExecutionOutcomes,
      );

      outcomes = outcomes.concat(executions.outcomes);
      outcomeReceipts = outcomeReceipts.concat(executions.outcomeReceipts);
    }),
  );

  const promises = [];

  if (outcomes.length) {
    for (let i = 0; i < outcomes.length; i += batchSize) {
      const batch = outcomes.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('execution_outcomes')
            .insert(batch)
            .onConflict(['receipt_id'])
            .ignore();
        }),
      );
    }
  }

  if (outcomeReceipts.length) {
    for (let i = 0; i < outcomeReceipts.length; i += batchSize) {
      const batch = outcomeReceipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('execution_outcome_receipts')
            .insert(batch)
            .onConflict([
              'executed_receipt_id',
              'index_in_execution_outcome',
              'produced_receipt_id',
            ])
            .ignore();
        }),
      );
    }
  }

  await Promise.all(promises);
  outcomeHistogram.labels(config.network).observe(performance.now() - start);
};

export const storeChunkExecutionOutcomes = (
  shardId: number,
  blockTimestamp: string,
  executionOutcomes: ExecutionOutcomeWithReceipt[],
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

    executionOutcome.executionOutcome.outcome.receiptIds.forEach(
      (receiptId, receiptIndex) => {
        outcomeReceipts.push(
          getExecutionOutcomeReceiptData(
            executionOutcome.executionOutcome.id,
            receiptId,
            receiptIndex,
          ),
        );
      },
    );
  });

  return { outcomeReceipts, outcomes };
};

const getExecutionOutcomeData = (
  shardId: number,
  blockTimestamp: string,
  indexInChunk: number,
  outcome: ExecutionOutcomeWithReceipt,
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
