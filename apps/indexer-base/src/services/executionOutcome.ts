import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { ExecutionOutcome } from 'nb-types';
import { retry } from 'nb-utils';

import { jsonStringify, mapExecutionStatus } from '#libs/utils';

export const storeExecutionOutcomes = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkExecutionOutcomes(
        knex,
        shard.shardId,
        message.block.header.timestampNanosec,
        shard.receiptExecutionOutcomes,
      );
    }),
  );
};

export const storeChunkExecutionOutcomes = async (
  knex: Knex,
  shardId: number,
  blockTimestamp: string,
  executionOutcomes: types.ExecutionOutcomeWithReceipt[],
) => {
  const outcomes: ExecutionOutcome[] = [];

  executionOutcomes.forEach((executionOutcome, indexInChunk) => {
    outcomes.push(
      getExecutionOutcomeData(
        shardId,
        blockTimestamp,
        indexInChunk,
        executionOutcome,
      ),
    );
  });

  const promises = [];

  if (outcomes.length) {
    promises.push(
      retry(async () => {
        await knex('execution_outcomes')
          .insert(outcomes)
          .onConflict(['receipt_id'])
          .merge(['logs']);
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
