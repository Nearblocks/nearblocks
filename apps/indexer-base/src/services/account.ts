import { Knex } from 'nb-knex';
import { BlockHeader, Message, Receipt } from 'nb-neardata';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isTransferAction,
} from '#libs/guards';
import { accountHistogram } from '#libs/prom';
import { isEthImplicit, isExecutionSuccess, isNearImplicit } from '#libs/utils';

type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts').insert(accounts).onConflict(['account_id']).ignore();
  });
};

export const storeAccounts = async (knex: Knex, message: Message) => {
  const start = performance.now();
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
      await knex('accounts')
        .insert([...accounts.values()])
        .onConflict(['account_id'])
        .merge();
    });
  }

  if (accountsToUpdate.size) {
    await Promise.all(
      [...accountsToUpdate.values()].map(async (account) => {
        await retry(async () => {
          await knex('accounts')
            .update({
              deleted_by_block_height: account.deleted_by_block_height,
              deleted_by_receipt_id: account.deleted_by_receipt_id,
            })
            .where('account_id', account.account_id)
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }

  accountHistogram.labels(config.network).observe(performance.now() - start);
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
          getAccountData(accountId, block.height, receiptId),
        );

        continue;
      }

      if (isDeleteAccountAction(action)) {
        const existingAccount = accounts.get(accountId);

        if (existingAccount) {
          accounts.set(accountId, {
            ...existingAccount,
            deleted_by_block_height: block.height,
            deleted_by_receipt_id: receiptId,
          });

          continue;
        }

        accountsToUpdate.set(
          accountId,
          getAccountData(
            accountId,
            block.height,
            receiptId,
            block.height,
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
          getAccountData(accountId, block.height, receiptId),
        );

        continue;
      }
    }
  }
};

export const getAccountData = (
  account: string,
  blockHeight: number,
  receiptId: null | string = null,
  deletedBlockBlockHeight: null | number = null,
  deletedReceiptId: null | string = null,
): Account => ({
  account_id: account,
  created_by_block_height: blockHeight,
  created_by_receipt_id: receiptId,
  deleted_by_block_height: deletedBlockBlockHeight,
  deleted_by_receipt_id: deletedReceiptId,
});
