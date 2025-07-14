import { BlockHeader, Message, Receipt } from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isTransferAction,
} from '#libs/guards';
import { isEthImplicit, isExecutionSuccess, isNearImplicit } from '#libs/utils';

type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts').insert(accounts).onConflict(['account_id']).ignore();
  });
};

export const storeAccounts = async (knex: Knex, message: Message) => {
  const accounts: AccountMap = new Map();
  const accountsToUpdate: AccountMap = new Map();

  for (const shard of message.shards) {
    for (const outcome of shard.receiptExecutionOutcomes) {
      if (
        outcome.receipt &&
        isExecutionSuccess(outcome.executionOutcome.outcome.status)
      ) {
        getChunkAccounts(
          message.block.header,
          outcome.receipt,
          accounts,
          accountsToUpdate,
        );
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

  if (accountsToUpdate.size) {
    await Promise.all(
      [...accountsToUpdate.values()].map(async (account) => {
        return retry(async () => {
          return knex('accounts')
            .update({
              deleted_by_block_timestamp: account.deleted_by_block_timestamp,
              deleted_by_receipt_id: account.deleted_by_receipt_id,
            })
            .where('account_id', account.account_id)
            .where(
              'created_by_block_timestamp',
              '<=',
              account.deleted_by_block_timestamp,
            )
            .andWhere(function () {
              this.whereNull('deleted_by_block_timestamp').orWhere(
                'deleted_by_block_timestamp',
                '<',
                account.deleted_by_block_timestamp,
              );
            });
        });
      }),
    );
  }
};

const getChunkAccounts = (
  block: BlockHeader,
  receipt: Receipt,
  accounts: AccountMap,
  accountsToUpdate: AccountMap,
) => {
  if (receipt?.receipt && 'Action' in receipt.receipt) {
    for (const action of receipt.receipt.Action.actions) {
      const receiptId = receipt.receiptId;
      const accountId = receipt.receiverId;

      if (isCreateAccountAction(action)) {
        accounts.set(
          accountId,
          getAccountData(accountId, block.timestampNanosec, receiptId),
        );

        continue;
      }

      if (isDeleteAccountAction(action)) {
        accountsToUpdate.set(
          accountId,
          getAccountData(
            accountId,
            block.timestampNanosec,
            receiptId,
            block.timestampNanosec,
            receiptId,
          ),
        );

        continue;
      }

      if (
        isTransferAction(action) &&
        (isNearImplicit(accountId) || isEthImplicit(accountId))
      ) {
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
