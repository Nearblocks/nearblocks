import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isTransferAction,
} from '#libs/guards';
import { isEthImplicit, isNearImplicit } from '#libs/utils';

type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex('accounts').insert(accounts).onConflict(['account_id']).ignore();
  });
};

export const getGenesisAccountData = (
  account: string,
  blockHeight: number,
): Account => ({
  account_id: account,
  created_by_block_height: blockHeight,
  created_by_receipt_id: null,
  deleted_by_block_height: null,
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
          accounts.set(
            accountId,
            getAccountData(block.height, accountId, receiptId),
          );
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
            getAccountData(
              block.height,
              accountId,
              null,
              receiptId,
              block.height,
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
            getAccountData(block.height, accountId, receiptId),
          );
        }
      }
    }
  }

  if (accounts.size) {
    await retry(async () => {
      await knex('accounts')
        .insert([...accounts.values()])
        .onConflict(['account_id'])
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
  blockHeight: number,
  account: string,
  receipt: null | string,
  deletedReceipt: null | string = null,
  deletedBlock: null | number = null,
): Account => ({
  account_id: account,
  created_by_block_height: blockHeight,
  created_by_receipt_id: receipt,
  deleted_by_block_height: deletedBlock,
  deleted_by_receipt_id: deletedReceipt,
});
