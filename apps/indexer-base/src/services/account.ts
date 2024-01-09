import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isTransferAction,
} from '#libs/guards';

type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts')
      .insert(accounts)
      .onConflict(['account_id', 'created_by_block_timestamp'])
      .ignore();
  });
};

export const getGenesisAccountData = (
  account: string,
  blockHeight: number,
  blockTimestamp: string,
): Account => ({
  account_id: account,
  created_by_block_height: blockHeight,
  created_by_block_timestamp: blockTimestamp,
  created_by_receipt_id: null,
  deleted_by_block_height: blockHeight,
  deleted_by_receipt_id: null,
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
        message.block.header,
      );
    }),
  );
};

export const storeChunkAccounts = async (
  knex: Knex,
  outcomes: types.ExecutionOutcomeWithReceipt[],
  block: types.BlockHeader,
) => {
  if (!outcomes.length) return;

  const accounts: AccountMap = new Map();
  const accountsToUpdate: AccountMap = new Map();

  const successfulReceipts = outcomes
    .filter((outcome) => {
      const keys = Object.keys(outcome.executionOutcome.outcome.status);

      return keys[0] === 'SuccessValue' || keys[0] === 'SuccessReceiptId';
    })
    .map((outcomes) => outcomes.receipt);

  for (const receipt of successfulReceipts) {
    if (receipt?.receipt && 'Action' in receipt.receipt) {
      for (const action of receipt.receipt.Action.actions) {
        const receiptId = receipt.receiptId;
        const accountId = receipt.receiverId;

        if (isCreateAccountAction(action)) {
          accounts.set(accountId, getAccountData(block, accountId, receiptId));
          continue;
        }

        if (isDeleteAccountAction(action)) {
          const account = accounts.get(accountId);

          if (account) {
            accounts.set(accountId, {
              ...account,
              deleted_by_block_height: block.height,
              deleted_by_receipt_id: receiptId,
            });
            continue;
          }

          accountsToUpdate.set(
            accountId,
            getAccountData(block, accountId, null, receiptId),
          );
          continue;
        }

        if (isTransferAction(action) && accountId.length === 64) {
          const existing = await knex('accounts')
            .select('account_id')
            .where('account_id', accountId)
            .where('created_by_block_height', '<', block.height)
            .where(function () {
              this.whereNull('deleted_by_block_height').orWhere(
                'deleted_by_block_height',
                '>',
                block.height,
              );
            })
            .first();

          if (!existing) {
            accounts.set(
              accountId,
              getAccountData(block, accountId, receiptId),
            );
          }
        }
      }
    }
  }

  if (accounts.size) {
    await retry(async () => {
      await knex('accounts')
        .insert([...accounts.values()])
        .onConflict(['account_id', 'created_by_block_timestamp'])
        .ignore();
    });
  }

  if (accountsToUpdate.size) {
    await Promise.all(
      [...accountsToUpdate.values()].map(async (account) => {
        await retry(async () => {
          await knex('accounts')
            .update('deleted_by_receipt_id', account.deleted_by_receipt_id)
            .update('deleted_by_block_height', account.deleted_by_block_height)
            .where('account_id', account.account_id)
            .where(
              'created_by_block_height',
              '<',
              account.deleted_by_block_height,
            )
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }
};

const getAccountData = (
  block: types.BlockHeader,
  account: string,
  receipt: null | string,
  deletedReceipt: null | string = null,
  deletedBlock: null | number = null,
): Account => ({
  account_id: account,
  created_by_block_height: block.height,
  created_by_block_timestamp: block.timestampNanosec,
  created_by_receipt_id: receipt,
  deleted_by_block_height: deletedBlock,
  deleted_by_receipt_id: deletedReceipt,
});
