import { Knex } from 'nb-knex';
import { BlockHeader, Message, Receipt } from 'nb-neardata';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import { isDeterministicStateInitAction } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';

type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts').insert(accounts).onConflict(['account_id']).ignore();
  });
};

export const storeAccounts = async (knex: Knex, message: Message) => {
  const accounts: AccountMap = new Map();

  for (const shard of message.shards) {
    for (const outcome of shard.receiptExecutionOutcomes) {
      if (
        outcome.receipt &&
        isExecutionSuccess(outcome.executionOutcome.outcome.status)
      ) {
        getChunkAccounts(message.block.header, outcome.receipt, accounts);
      }
    }
  }

  if (accounts.size) {
    await retry(async () => {
      return knex('accounts')
        .insert([...accounts.values()])
        .onConflict(['account_id'])
        .merge()
        .whereRaw(
          'accounts.created_by_block_timestamp < EXCLUDED.created_by_block_timestamp',
        );
    });
  }
};

const getChunkAccounts = (
  block: BlockHeader,
  receipt: Receipt,
  accounts: AccountMap,
) => {
  if (receipt?.receipt && 'Action' in receipt.receipt) {
    for (const action of receipt.receipt.Action.actions) {
      const receiptId = receipt.receiptId;
      const accountId = receipt.receiverId;

      if (isDeterministicStateInitAction(action)) {
        accounts.set(
          accountId,
          getAccountData(accountId, block.timestampNanosec, receiptId),
        );

        continue;
      }
    }
  }
};

export const getAccountData = (
  account: string,
  blockTimestamp: string,
  receiptId: null | string = null,
  deletedBlockBlockTimestamp: null | string = null,
  deletedReceiptId: null | string = null,
): Account => ({
  account_id: account,
  created_by_block_timestamp: blockTimestamp,
  created_by_receipt_id: receiptId,
  deleted_by_block_timestamp: deletedBlockBlockTimestamp,
  deleted_by_receipt_id: deletedReceiptId,
});
