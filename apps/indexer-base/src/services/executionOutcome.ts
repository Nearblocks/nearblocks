import { types } from 'near-lake-framework';
import { PoolClient } from 'pg';

import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';

import config from '#config';
import { jsonStringify, mapExecutionStatus } from '#libs/utils';

type OutcomeColumns = {
  [K in keyof ExecutionOutcome]: ExecutionOutcome[K][];
};
type OutcomeReceiptColumns = {
  [K in keyof ExecutionOutcomeReceipt]: ExecutionOutcomeReceipt[K][];
};

const batchSize = config.insertLimit;

export const storeExecutionOutcomes = async (
  pg: PoolClient,
  message: types.StreamerMessage,
) => {
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
      const columns: OutcomeColumns = {
        executed_in_block_hash: [],
        executed_in_block_timestamp: [],
        executor_account_id: [],
        gas_burnt: [],
        index_in_chunk: [],
        logs: [],
        receipt_id: [],
        shard_id: [],
        status: [],
        tokens_burnt: [],
      };

      batch.forEach((outcome) => {
        columns.executed_in_block_hash.push(outcome.executed_in_block_hash);
        columns.executed_in_block_timestamp.push(
          outcome.executed_in_block_timestamp,
        );
        columns.executor_account_id.push(outcome.executor_account_id);
        columns.gas_burnt.push(outcome.gas_burnt);
        columns.index_in_chunk.push(outcome.index_in_chunk);
        columns.logs.push(outcome.logs);
        columns.receipt_id.push(outcome.receipt_id);
        columns.shard_id.push(outcome.shard_id);
        columns.status.push(outcome.status);
        columns.tokens_burnt.push(outcome.tokens_burnt);
      });

      promises.push(
        pg.query({
          name: 'insert_execution_outcomes',
          text: `
            INSERT INTO
              execution_outcomes (
                executed_in_block_hash,
                executed_in_block_timestamp,
                executor_account_id,
                gas_burnt,
                index_in_chunk,
                logs,
                receipt_id,
                shard_id,
                status,
                tokens_burnt
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::TEXT[],
                $2::BIGINT[],
                $3::TEXT[],
                $4::NUMERIC[],
                $5::INTEGER[],
                $6::JSONB[],
                $7::TEXT[],
                $8::NUMERIC[],
                $9::execution_outcome_status[],
                $10::NUMERIC[]
              )
            ON CONFLICT (receipt_id) DO NOTHING
          `,
          values: [
            columns.executed_in_block_hash,
            columns.executed_in_block_timestamp,
            columns.executor_account_id,
            columns.gas_burnt,
            columns.index_in_chunk,
            columns.logs,
            columns.receipt_id,
            columns.shard_id,
            columns.status,
            columns.tokens_burnt,
          ],
        }),
      );
    }
  }

  if (outcomeReceipts.length) {
    for (let i = 0; i < outcomeReceipts.length; i += batchSize) {
      const batch = outcomeReceipts.slice(i, i + batchSize);
      const columns: OutcomeReceiptColumns = {
        executed_receipt_id: [],
        index_in_execution_outcome: [],
        produced_receipt_id: [],
      };

      batch.forEach((outcome) => {
        columns.executed_receipt_id.push(outcome.executed_receipt_id);
        columns.index_in_execution_outcome.push(
          outcome.index_in_execution_outcome,
        );
        columns.produced_receipt_id.push(outcome.produced_receipt_id);
      });

      promises.push(
        pg.query({
          name: 'insert_execution_outcome_receipts',
          text: `
            INSERT INTO
              execution_outcome_receipts (
                executed_receipt_id,
                index_in_execution_outcome,
                produced_receipt_id
              )
            SELECT
              *
            FROM
              UNNEST(
                $1::TEXT[],
                $2::INTEGER[],
                $3::TEXT[]
              )
            ON CONFLICT (
              executed_receipt_id,
              index_in_execution_outcome,
              produced_receipt_id
            ) DO NOTHING
          `,
          values: [
            columns.executed_receipt_id,
            columns.index_in_execution_outcome,
            columns.produced_receipt_id,
          ],
        }),
      );
    }
  }

  await Promise.all(promises);
};

export const storeChunkExecutionOutcomes = (
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
