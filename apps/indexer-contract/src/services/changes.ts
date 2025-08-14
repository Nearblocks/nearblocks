import { createHash } from 'crypto';

import { base58 } from '@scure/base';

import {
  BlockHeader,
  StateChange as BStateChange,
  ExecutionOutcomeWithReceipt,
  Message,
  Shard,
} from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import {
  ContractCodeEvent,
  ContractDataEvent,
  ContractEventType,
  StateChangeCauseView,
} from 'nb-types';
import { retry } from 'nb-utils';

import {
  isContractDeletion,
  isContractUpdate,
  isDataDeletion,
  isDataUpdate,
} from '#libs/guards';
import {
  ContractCode,
  ContractData,
  ContractDeletion,
  ContractUpdate,
  DataDeletion,
  DataUpdate,
  StateChange,
} from '#types/types';

type ContractChanges = {
  code: Map<string, ContractCode>;
  data: Map<string, ContractData>;
};

type ContractEvents = {
  code: ContractCodeEvent[];
  data: ContractDataEvent[];
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
    data: new Map(),
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
            type: ContractEventType.DELETE,
          });
          break;
        }
        case isDataUpdate(change): {
          const dataUpdate = change.change as DataUpdate;

          changes.data.set(change.cause.receiptHash, {
            accountId: dataUpdate.accountId,
            keyBase64: dataUpdate.keyBase64,
            type: ContractEventType.UPDATE,
            valueBase64: dataUpdate.valueBase64,
          });
          break;
        }
        case isDataDeletion(change): {
          const dataDeletion = change.change as DataDeletion;

          changes.data.set(change.cause.receiptHash, {
            accountId: dataDeletion.accountId,
            keyBase64: dataDeletion.keyBase64,
            type: ContractEventType.DELETE,
            valueBase64: null,
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
    data: [],
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
        index_in_chunk: 0, // placeholder; actual value will be set later
        receipt_id: receiptId,
        shard_id: 0, // placeholder; actual value will be set later
      });
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
