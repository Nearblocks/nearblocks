import { types } from 'near-lake-framework';

import { Account } from 'nb-types';

import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isTransferAction,
} from '#libs/guards';
import { accountColumns, pgp } from '#libs/pgp';
import { isEthImplicit, isNearImplicit } from '#libs/utils';
import { PgpQuery } from '#types/types';

type AccountMap = Map<string, Account>;

export const storeAccounts = async (message: types.StreamerMessage) => {
  let accounts: Account[] = [];
  let accountsToUpdate: Account[] = [];

  await Promise.all(
    message.shards.map(async (shard) => {
      const chunks = storeChunkAccounts(
        shard.receiptExecutionOutcomes,
        message.block.header,
      );

      accounts = accounts.concat(chunks?.accounts ?? []);
      accountsToUpdate = accountsToUpdate.concat(
        chunks?.accountsToUpdate ?? [],
      );
    }),
  );

  const queries: PgpQuery[] = [];

  if (accounts.length) {
    queries.push(
      pgp.helpers.insert(accounts, accountColumns) +
        ' ON CONFLICT (account_id) DO NOTHING',
    );
  }

  if (accountsToUpdate.length) {
    queries.concat(
      accountsToUpdate.map((account) => {
        return {
          query: `
            UPDATE accounts
            SET
              deleted_by_receipt_id = $1,
              deleted_by_block_height = $2
            WHERE
              account_id = $3
              AND created_by_block_height < $4
              AND deleted_by_block_height IS NULL
          `,
          values: [
            account.deleted_by_receipt_id,
            account.deleted_by_block_height,
            account.account_id,
            account.deleted_by_block_height,
          ],
        };
      }),
    );
  }

  return queries;
};

export const storeChunkAccounts = (
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

  return {
    accounts: [...accounts.values()],
    accountsToUpdate: [...accountsToUpdate.values()],
  };
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
