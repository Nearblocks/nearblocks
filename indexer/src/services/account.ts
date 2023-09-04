import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import retry from '#libs/retry';
import { Account } from '#ts/types';
import {
  isTransferAction,
  isCreateAccountAction,
  isDeleteAccountAction,
} from '#libs/guards';

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts').insert(accounts).onConflict('account_id').ignore();
  });
};

export const getGenesisAccountData = (
  account: string,
  blockHeight: number,
): Account => ({
  account_id: account,
  created_by_receipt_id: null,
  deleted_by_receipt_id: null,
  last_update_block_height: blockHeight,
});

export const storeAccounts = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkAccounts(
        knex,
        shard.receiptExecutionOutcomes,
        message.block.header.height,
      );
    }),
  );
};

export const storeChunkAccounts = async (
  knex: Knex,
  outcomes: types.ExecutionOutcomeWithReceipt[],
  blockHeight: number,
) => {
  if (!outcomes.length) return;

  const accounts: Map<string, Account> = new Map();
  const accountsToUpdate: Map<string, Account> = new Map();

  const successfulReceipts = outcomes
    .filter((outcome) => {
      const keys = Object.keys(outcome.executionOutcome.outcome.status);

      return keys[0] === 'SuccessValue' || keys[0] === 'SuccessReceiptId';
    })
    .map((outcomes) => outcomes.receipt);

  successfulReceipts.forEach((receipt) => {
    if (receipt?.receipt && 'Action' in receipt.receipt) {
      receipt.receipt.Action.actions.forEach((action) => {
        const receiptId = receipt.receiptId;
        const accountId = receipt.receiverId;

        if (isCreateAccountAction(action)) {
          return accounts.set(
            accountId,
            getAccountData(blockHeight, accountId, receiptId),
          );
        }

        if (isDeleteAccountAction(action)) {
          if (accounts.has(accountId)) {
            return accounts.set(
              accountId,
              getAccountData(blockHeight, accountId, receiptId, receiptId),
            );
          }

          return accountsToUpdate.set(
            accountId,
            getAccountData(blockHeight, accountId, null, receiptId),
          );
        }

        if (isTransferAction(action)) {
          if (accountId.length === 64) {
            return accounts.set(
              accountId,
              getAccountData(blockHeight, accountId, receiptId),
            );
          }
        }

        return;
      });
    }
  });

  if (accounts.size) {
    await retry(async () => {
      await knex('accounts')
        .insert([...accounts.values()])
        .onConflict('account_id')
        .merge([
          'created_by_receipt_id',
          'deleted_by_receipt_id',
          'last_update_block_height',
        ]);
    });
  }

  if (accountsToUpdate.size) {
    await retry(async () => {
      await knex('accounts')
        .insert([...accountsToUpdate.values()])
        .onConflict('account_id')
        .merge(['deleted_by_receipt_id', 'last_update_block_height']);
    });
  }
};

const getAccountData = (
  blockHeight: number,
  account: string,
  receipt: string | null,
  deletedReceipt: string | null = null,
): Account => ({
  account_id: account,
  created_by_receipt_id: receipt,
  deleted_by_receipt_id: deletedReceipt,
  last_update_block_height: blockHeight,
});
