import { Knex } from 'nb-knex';
import {
  Action,
  ExecutionOutcomeWithReceipt,
  Receipt as JReceipt,
  Message,
} from 'nb-neardata';
import {
  ActionReceiptAction,
  ExecutionOutcome,
  ExecutionOutcomeReceipt,
  Receipt,
} from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isDelegateAction } from '#libs/guards';
import { outcomeHistogram } from '#libs/prom';
import {
  getExecutionResult,
  jsonStringify,
  mapActionKind,
  mapExecutionStatus,
  mapReceiptKind,
} from '#libs/utils';

const batchSize = config.insertLimit;

export const storeExecutionOutcomes = async (knex: Knex, message: Message) => {
  const start = performance.now();
  let receipts: Receipt[] = [];
  let actions: ActionReceiptAction[] = [];
  let outcomes: ExecutionOutcome[] = [];
  let outcomeReceipts: ExecutionOutcomeReceipt[] = [];

  message.shards.forEach(async (shard) => {
    const chunkHash = shard.chunk?.header.chunkHash;

    if (!chunkHash && shard.receiptExecutionOutcomes.length) {
      throw new Error('Chunk hash is required');
    }

    if (chunkHash) {
      const executions = storeChunkExecutionOutcomes(
        shard.shardId,
        chunkHash,
        message.block.header.hash,
        message.block.header.timestampNanosec,
        shard.receiptExecutionOutcomes,
      );

      outcomes = outcomes.concat(executions.outcomes);
      outcomeReceipts = outcomeReceipts.concat(executions.outcomeReceipts);
      receipts = receipts.concat(executions.receipts);
      actions = actions.concat(executions.actions);
    }
  });

  const promises = [];

  if (receipts.length) {
    for (let i = 0; i < receipts.length; i += batchSize) {
      const batch = receipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('receipts')
            .insert(batch)
            .onConflict(['receipt_id', 'included_in_block_timestamp'])
            .ignore();
        }),
      );
    }
  }

  if (actions.length) {
    for (let i = 0; i < actions.length; i += batchSize) {
      const batch = actions.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('action_receipt_actions')
            .insert(batch)
            .onConflict([
              'receipt_id',
              'index_in_action_receipt',
              'receipt_included_in_block_timestamp',
            ])
            .ignore();
        }),
      );
    }
  }

  if (outcomes.length) {
    for (let i = 0; i < outcomes.length; i += batchSize) {
      const batch = outcomes.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await knex('execution_outcomes')
            .insert(batch)
            .onConflict(['receipt_id', 'executed_in_block_timestamp'])
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
  outcomeHistogram.observe(performance.now() - start);
};

export const storeChunkExecutionOutcomes = (
  shardId: number,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  executionOutcomes: ExecutionOutcomeWithReceipt[],
) => {
  const receipts: Receipt[] = [];
  const actions: ActionReceiptAction[] = [];
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

    if (
      executionOutcome.receipt &&
      'Action' in executionOutcome.receipt.receipt
    ) {
      const receiptId = executionOutcome.receipt.receiptId;
      const predecessorId = executionOutcome.receipt.predecessorId;
      const receiverId = executionOutcome.receipt.receiverId;
      const publicKey = executionOutcome.receipt.receipt.Action.signerPublicKey;
      const refundTo = executionOutcome.receipt.receipt.Action.refundTo || null;

      receipts.push(
        getReceiptData(
          executionOutcome.receipt,
          shardId,
          chunkHash,
          blockHash,
          blockTimestamp,
          executionOutcome.txHash,
          indexInChunk,
          publicKey,
          refundTo,
        ),
      );

      let actionIndex = 0;
      executionOutcome.receipt.receipt.Action.actions.forEach((action) => {
        if (isDelegateAction(action)) {
          actions.push(
            getActionReceiptActionData(
              shardId,
              blockTimestamp,
              receiptId,
              indexInChunk,
              actionIndex,
              action,
              predecessorId,
              receiverId,
            ),
          );
          actionIndex += 1;

          action.Delegate.delegateAction.actions.forEach((action) => {
            actions.push(
              getActionReceiptActionData(
                shardId,
                blockTimestamp,
                receiptId,
                indexInChunk,
                actionIndex,
                action,
                predecessorId,
                receiverId,
              ),
            );
            actionIndex += 1;
          });

          return;
        }

        actions.push(
          getActionReceiptActionData(
            shardId,
            blockTimestamp,
            receiptId,
            indexInChunk,
            actionIndex,
            action,
            predecessorId,
            receiverId,
          ),
        );
        actionIndex += 1;
      });
    }
  });

  return { actions, outcomeReceipts, outcomes, receipts };
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
  result: getExecutionResult(outcome.executionOutcome.outcome.status),
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

const getReceiptData = (
  receipt: JReceipt,
  shardId: number,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  transactionHash: string,
  indexInChunk: number,
  publicKey: null | string,
  refundTo: null | string,
): Receipt => ({
  included_in_block_hash: blockHash,
  included_in_block_timestamp: blockTimestamp,
  included_in_chunk_hash: chunkHash,
  index_in_chunk: indexInChunk,
  originated_from_transaction_hash: transactionHash,
  predecessor_account_id: receipt.predecessorId,
  public_key: publicKey,
  receipt_id: receipt.receiptId,
  receipt_kind: mapReceiptKind(receipt.receipt),
  receiver_account_id: receipt.receiverId,
  refund_to_account_id: refundTo,
  shard_id: shardId,
});

const getActionReceiptActionData = (
  shardId: number,
  blockTimestamp: string,
  receiptId: string,
  chunkIndex: number,
  actionIndex: number,
  action: Action,
  predecessorId: string,
  receiverId: string,
): ActionReceiptAction => {
  const { args, kind, rlpHash } = mapActionKind(action);

  return {
    action_kind: kind,
    args,
    index_in_action_receipt: actionIndex,
    index_in_chunk: chunkIndex,
    nep518_rlp_hash: rlpHash,
    receipt_id: receiptId,
    receipt_included_in_block_timestamp: blockTimestamp,
    receipt_predecessor_account_id: predecessorId,
    receipt_receiver_account_id: receiverId,
    shard_id: shardId,
  };
};
