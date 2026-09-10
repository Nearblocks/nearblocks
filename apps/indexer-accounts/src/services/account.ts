import { Knex } from 'nb-knex';
import { BlockHeader, Message, Receipt } from 'nb-neardata';
import { Account } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import {
  isCreateAccountAction,
  isDeleteAccountAction,
  isDeterministicStateInitAction,
  isTransferAction,
} from '#libs/guards';
import { tbl } from '#libs/knex';
import { isEthImplicit, isExecutionSuccess, isNearImplicit } from '#libs/utils';

export type AccountMap = Map<string, Account>;

export const storeGenesisAccounts = async (knex: Knex, accounts: Account[]) => {
  await retry(async () => {
    await knex(tbl('accounts'))
      .insert(accounts)
      .onConflict(['account_id'])
      .ignore();
  });
};

export const storeAccounts = async (knex: Knex, message: Message) => {
  const accounts: AccountMap = new Map();
  const accountsToUpdate: AccountMap = new Map();

  collectAccounts(message, accounts, accountsToUpdate);
  await flushAccounts(knex, accounts, accountsToUpdate);
};

export const collectAccounts = (
  message: Message,
  accounts: AccountMap,
  accountsToUpdate: AccountMap,
) => {
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
};

const insertAccounts = async (knex: Knex, accounts: AccountMap) => {
  if (!accounts.size) {
    return;
  }

  const rows = [...accounts.values()];

  for (let i = 0; i < rows.length; i += config.insertLimit) {
    const batch = rows.slice(i, i + config.insertLimit);

    await retry(async () => {
      return knex(tbl('accounts'))
        .insert(batch)
        .onConflict(['account_id'])
        .merge()
        .whereRaw(
          'accounts.deleted_by_block_timestamp IS NOT NULL AND accounts.deleted_by_block_timestamp <= EXCLUDED.created_by_block_timestamp',
        );
    });
  }
};

export const flushAccounts = async (
  knex: Knex,
  accounts: AccountMap,
  accountsToUpdate: AccountMap,
) => {
  await insertAccounts(knex, accounts);

  if (accountsToUpdate.size) {
    const rows = [...accountsToUpdate.values()].map((account) => ({
      account_id: account.account_id,
      deleted_by_block_timestamp: account.deleted_by_block_timestamp,
      deleted_by_receipt_id: account.deleted_by_receipt_id,
    }));

    for (let i = 0; i < rows.length; i += config.insertLimit) {
      const batch = rows.slice(i, i + config.insertLimit);

      await retry(async () => {
        return knex.raw(
          `
            UPDATE ${tbl('accounts')} a
            SET
              deleted_by_block_timestamp = v.deleted_by_block_timestamp,
              deleted_by_receipt_id = v.deleted_by_receipt_id
            FROM jsonb_to_recordset(:rows) AS v(
              account_id text,
              deleted_by_block_timestamp bigint,
              deleted_by_receipt_id text
            )
            WHERE a.account_id = v.account_id
              AND a.created_by_block_timestamp <= v.deleted_by_block_timestamp
              AND (
                a.deleted_by_block_timestamp IS NULL
                OR a.deleted_by_block_timestamp < v.deleted_by_block_timestamp
              )
          `,
          { rows: JSON.stringify(batch) },
        );
      });
    }
  }

  await insertAccounts(knex, accounts);
};

const needsFreshAccountEntry = (
  accounts: AccountMap,
  accountsToUpdate: AccountMap,
  accountId: string,
): boolean => {
  const pending = accounts.get(accountId);

  if (!pending) {
    return true;
  }

  const createdTs = BigInt(pending.created_by_block_timestamp);
  const ownDeletedTs = pending.deleted_by_block_timestamp
    ? BigInt(pending.deleted_by_block_timestamp)
    : null;
  const queuedDeletedTs =
    accountsToUpdate.get(accountId)?.deleted_by_block_timestamp;
  const queuedTs = queuedDeletedTs ? BigInt(queuedDeletedTs) : null;
  const latestDeleteTs =
    ownDeletedTs && queuedTs
      ? ownDeletedTs > queuedTs
        ? ownDeletedTs
        : queuedTs
      : ownDeletedTs ?? queuedTs;

  return latestDeleteTs !== null && latestDeleteTs > createdTs;
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
        if (accountsToUpdate.has(accountId) && accounts.has(accountId)) {
          const pending = accounts.get(accountId);

          if (pending) {
            accounts.set(accountId, {
              ...pending,
              deleted_by_block_timestamp: block.timestampNanosec,
              deleted_by_receipt_id: receiptId,
            });
          }

          continue;
        }

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

      if (isDeterministicStateInitAction(action)) {
        accounts.set(
          accountId,
          getAccountData(accountId, block.timestampNanosec, receiptId),
        );

        continue;
      }

      if (
        isTransferAction(action) &&
        (isNearImplicit(accountId) || isEthImplicit(accountId)) &&
        needsFreshAccountEntry(accounts, accountsToUpdate, accountId)
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
