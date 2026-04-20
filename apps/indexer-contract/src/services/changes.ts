import { Knex } from 'nb-knex';
import {
  BlockHeader,
  ExecutionOutcomeWithReceipt,
  ExecutionStatus,
  Message,
  Shard,
} from 'nb-neardata';
import { ContractCodeEvent, ContractEventType } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isUseGlobalContractAction,
  isUseGlobalContractByAccountIdAction,
} from '#libs/guards';

type ContractEvents = {
  code: ContractCodeEvent[];
};

export const storeChanges = async (knex: Knex, message: Message) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkChanges(knex, shard, message.block.header);
    }),
  );
};

export const storeChunkChanges = async (
  knex: Knex,
  shard: Shard,
  block: BlockHeader,
) => {
  const { code } = getReceiptChanges(shard.receiptExecutionOutcomes, block);

  await Promise.all([insertCodeChanges(knex, shard.shardId, code)]);
};

const getReceiptChanges = (
  outcomes: ExecutionOutcomeWithReceipt[],
  block: BlockHeader,
) => {
  const result: ContractEvents = {
    code: [],
  };

  for (const outcome of outcomes) {
    if (!outcome.receipt) continue;

    const receiptId = outcome.receipt.receiptId;

    if (
      isExecutionSuccess(outcome.executionOutcome.outcome.status) &&
      'Action' in outcome.receipt.receipt &&
      outcome.receipt.receipt.Action.actions.length
    ) {
      for (const action of outcome.receipt.receipt.Action.actions) {
        if (isUseGlobalContractAction(action)) {
          result.code.push({
            block_height: block.height,
            block_timestamp: block.timestampNanosec,
            code_base64: null,
            code_hash: null,
            contract_account_id: outcome.receipt.receiverId,
            event_type: ContractEventType.UPDATE,
            global_account_id: null,
            global_code_hash: action.UseGlobalContract.codeHash,
            index_in_chunk: 0, // placeholder; actual value will be set later
            receipt_id: receiptId,
            shard_id: 0, // placeholder; actual value will be set later
          });
        } else if (isUseGlobalContractByAccountIdAction(action)) {
          result.code.push({
            block_height: block.height,
            block_timestamp: block.timestampNanosec,
            code_base64: null,
            code_hash: null,
            contract_account_id: outcome.receipt.receiverId,
            event_type: ContractEventType.UPDATE,
            global_account_id: action.UseGlobalContractByAccountId.accountId,
            global_code_hash: null,
            index_in_chunk: 0, // placeholder; actual value will be set later
            receipt_id: receiptId,
            shard_id: 0, // placeholder; actual value will be set later
          });
        }
      }
    }
  }

  return result;
};

const insertCodeChanges = async (
  knex: Knex,
  shardId: number,
  changes: ContractCodeEvent[],
) => {
  const legnth = changes.length;

  if (!legnth) return;

  for (let index = 0; index < legnth; index++) {
    changes[index].shard_id = shardId;
    changes[index].index_in_chunk = index;
  }

  await retry(async () => {
    await knex('contract_code_events')
      .insert(changes)
      .onConflict(['block_timestamp', 'shard_id', 'index_in_chunk'])
      .ignore();
  });
};

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};
