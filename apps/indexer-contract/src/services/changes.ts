import { createHash } from 'crypto';

import { base58 } from '@scure/base';

import { Knex } from 'nb-knex';
import {
  BlockHeader,
  StateChange as BStateChange,
  ExecutionOutcomeWithReceipt,
  ExecutionStatus,
  Message,
  Shard,
} from 'nb-neardata';
import {
  ContractCodeEvent,
  ContractEventType,
  StateChangeCauseView,
} from 'nb-types';
import { retry } from 'nb-utils';

import {
  isContractDeletion,
  isContractUpdate,
  isUseGlobalContractAction,
  isUseGlobalContractByAccountIdAction,
} from '#libs/guards';
import {
  ContractCode,
  ContractDeletion,
  ContractUpdate,
  StateChange,
} from '#types/types';

type ContractChanges = {
  code: Map<string, ContractCode>;
};

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
  const changes = getStateChanges(shard.stateChanges);
  const { code } = getReceiptChanges(
    shard.receiptExecutionOutcomes,
    changes.code,
    block,
  );

  await Promise.all([insertCodeChanges(knex, shard.shardId, code)]);
};

const getStateChanges = (stateChanges: BStateChange[]) => {
  const changes: ContractChanges = {
    code: new Map(),
  };

  for (const stateChange of stateChanges) {
    if (stateChange.cause.type === StateChangeCauseView.ReceiptProcessing) {
      const change = stateChange as StateChange<unknown>;

      switch (true) {
        case isContractUpdate(change): {
          const contractUpdate = change.change as ContractUpdate;

          changes.code.set(change.cause.receiptHash, {
            accountId: contractUpdate.accountId,
            codeBase64: contractUpdate.codeBase64,
            codeHash: getCodeHash(contractUpdate.codeBase64),
            globalAccountId: null,
            globalCodeHash: null,
            type: ContractEventType.UPDATE,
          });

          break;
        }
        case isContractDeletion(change): {
          const contractDeletion = change.change as ContractDeletion;

          changes.code.set(change.cause.receiptHash, {
            accountId: contractDeletion.accountId,
            codeBase64: null,
            codeHash: null,
            globalAccountId: null,
            globalCodeHash: null,
            type: ContractEventType.DELETE,
          });

          break;
        }

        default:
          break;
      }
    }
  }

  return changes;
};

const getReceiptChanges = (
  outcomes: ExecutionOutcomeWithReceipt[],
  codeChanges: Map<string, ContractCode>,
  block: BlockHeader,
) => {
  const result: ContractEvents = {
    code: [],
  };

  for (const outcome of outcomes) {
    if (!outcome.receipt) continue;

    const receiptId = outcome.receipt.receiptId;
    const affectedAccount = outcome.receipt.receiverId;

    const codeChange = codeChanges.get(receiptId);

    if (codeChange) {
      if (codeChange.accountId !== affectedAccount) {
        throw new Error(
          `Unexpected code change info found for receipt ${receiptId}. Expected account ${affectedAccount}, Actual account ${codeChange.accountId}`,
        );
      }

      codeChanges.delete(receiptId);

      result.code.push({
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        code_base64: codeChange.codeBase64,
        code_hash: codeChange.codeHash,
        contract_account_id: codeChange.accountId,
        event_type: codeChange.type,
        global_account_id: null,
        global_code_hash: null,
        index_in_chunk: 0, // placeholder; actual value will be set later
        receipt_id: receiptId,
        shard_id: 0, // placeholder; actual value will be set later
      });
    }

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

  if (codeChanges.size) {
    throw new Error(
      `${
        codeChanges.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${[...codeChanges.keys()]}, values: ${JSON.stringify([
        ...codeChanges.values(),
      ])}`,
    );
  }

  return result;
};

const getCodeHash = (code: string) => {
  if (!code) return null;

  const codeBytes = Uint8Array.from(Buffer.from(code, 'base64'));
  const sha = createHash('sha256').update(codeBytes).digest();

  return base58.encode(Uint8Array.from(sha));
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
