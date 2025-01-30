import { types } from 'near-lake-framework';

import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';

import { exectionColumns, executionOutcomeColumns, pgp } from '#libs/pgp';
import { jsonStringify, mapExecutionStatus } from '#libs/utils';

export const storeExecutionOutcomes = async (
  message: types.StreamerMessage,
) => {
  let outcomes: ExecutionOutcome[] = [];
  let outcomeReceipts: ExecutionOutcomeReceipt[] = [];

  message.shards.map(async (shard) => {
    const executions = storeChunkExecutionOutcomes(
      shard.shardId,
      message.block.header.timestampNanosec,
      shard.receiptExecutionOutcomes,
    );

    outcomes = outcomes.concat(executions.outcomes);
    outcomeReceipts = outcomeReceipts.concat(executions.outcomeReceipts);
  });

  const queries = [];

  if (outcomes.length) {
    queries.push(
      pgp.helpers.insert(outcomes, exectionColumns) +
        ' ON CONFLICT (receipt_id) DO NOTHING',
    );
  }

  if (outcomeReceipts.length) {
    queries.push(
      pgp.helpers.insert(outcomeReceipts, executionOutcomeColumns) +
        ` ON CONFLICT (
          executed_receipt_id,
          index_in_execution_outcome,
          produced_receipt_id
        ) DO NOTHING`,
    );
  }

  return queries;
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
