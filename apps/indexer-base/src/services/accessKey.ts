import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { AccessKey, AccessKeyPermissionKind } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isAddKeyAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isTransferAction,
} from '#libs/guards';
import { publicKeyFromImplicitAccount } from '#libs/utils';

type AccessKeyMap = Map<string, AccessKey>;
type DeletedAccountMap = Map<string, { accountId: string; receiptId: string }>;

export const storeGenesisAccessKeys = async (
  knex: Knex,
  accessKeys: AccessKey[],
) => {
  await retry(async () => {
    await knex('access_keys')
      .insert(accessKeys)
      .onConflict(['public_key', 'account_id'])
      .ignore();
  });
};

export const getGenesisAccessKeyData = (
  account: string,
  publicKey: string,
  permission: string,
  blockHeight: number,
): AccessKey => {
  const permissionKind =
    permission === 'string'
      ? AccessKeyPermissionKind.FULL_ACCESS
      : AccessKeyPermissionKind.FUNCTION_CALL;

  return {
    account_id: account,
    created_by_block_height: blockHeight,
    created_by_receipt_id: null,
    deleted_by_block_height: null,
    deleted_by_receipt_id: null,
    permission_kind: permissionKind,
    public_key: publicKey,
  };
};

export const storeAccessKeys = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkAccessKeys(
        knex,
        message.block.header,
        shard.receiptExecutionOutcomes,
      );
    }),
  );
};

export const storeChunkAccessKeys = async (
  knex: Knex,
  block: types.BlockHeader,
  outcomes: types.ExecutionOutcomeWithReceipt[],
) => {
  if (!outcomes.length) return;

  const accessKeys: AccessKeyMap = new Map();
  const accessKeysToUpdate: AccessKeyMap = new Map();
  const deletedAccounts: DeletedAccountMap = new Map();

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

        if (isDeleteAccountAction(action)) {
          deletedAccounts.set(accountId, {
            accountId,
            receiptId,
          });
          accessKeys.forEach((value, key) => {
            if (value.account_id === accountId) {
              accessKeys.set(key, {
                ...value,
                deleted_by_block_height: block.height,
                deleted_by_receipt_id: receiptId,
              });
            }
          });
          continue;
        }

        if (isAddKeyAction(action)) {
          const { accessKey, publicKey } = action.AddKey;

          accessKeys.set(
            `${accountId}:${publicKey}`,
            getAccessKeyData(
              block.height,
              accountId,
              publicKey,
              accessKey.permission,
              receiptId,
            ),
          );
          continue;
        }

        if (isDeleteKeyAction(action)) {
          const { publicKey } = action.DeleteKey;
          const accessKey = accessKeys.get(`${accountId}:${publicKey}`);

          if (accessKey) {
            accessKeys.set(`${accountId}:${publicKey}`, {
              ...accessKey,
              deleted_by_block_height: block.height,
              deleted_by_receipt_id: receiptId,
            });
            continue;
          }

          accessKeysToUpdate.set(
            `${accountId}:${publicKey}`,
            getAccessKeyData(
              block.height,
              accountId,
              publicKey,
              AccessKeyPermissionKind.FULL_ACCESS,
              null,
              receiptId,
              block.height,
            ),
          );
          continue;
        }

        if (isTransferAction(action) && accountId.length === 64) {
          const publicKey = publicKeyFromImplicitAccount(accountId);

          if (publicKey) {
            accessKeys.set(
              `${accountId}:${publicKey}`,
              getAccessKeyData(
                block.height,
                accountId,
                publicKey,
                AccessKeyPermissionKind.FULL_ACCESS,
                receiptId,
              ),
            );
          }
        }
      }
    }
  }

  if (deletedAccounts.size) {
    await Promise.all(
      [...deletedAccounts.values()].map(async (key) => {
        await retry(async () => {
          await knex('access_keys')
            .update('deleted_by_receipt_id', key.receiptId)
            .update('deleted_by_block_height', block.height)
            .where('account_id', key.accountId)
            .where('created_by_block_height', '<', block.height)
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }

  if (accessKeys.size) {
    await retry(async () => {
      await knex('access_keys').insert([...accessKeys.values()]);
    });
  }

  if (accessKeysToUpdate.size) {
    await Promise.all(
      [...accessKeysToUpdate.values()].map(async (key) => {
        await retry(async () => {
          await knex('access_keys')
            .update('deleted_by_receipt_id', key.deleted_by_receipt_id)
            .update('deleted_by_block_height', key.deleted_by_block_height)
            .where('account_id', key.account_id)
            .where('public_key', key.public_key)
            .where('created_by_block_height', '<', key.deleted_by_block_height)
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }
};

const getAccessKeyData = (
  blockHeight: number,
  account: string,
  publicKey: string,
  permission: string | types.AccessKeyFunctionCallPermission,
  receipt: null | string,
  deletedReceipt: null | string = null,
  deletedBlock: null | number = null,
): AccessKey => {
  const permissionKind =
    typeof permission === 'string'
      ? AccessKeyPermissionKind.FULL_ACCESS
      : AccessKeyPermissionKind.FUNCTION_CALL;

  return {
    account_id: account,
    created_by_block_height: blockHeight,
    created_by_receipt_id: receipt,
    deleted_by_block_height: deletedBlock,
    deleted_by_receipt_id: deletedReceipt,
    permission_kind: permissionKind,
    public_key: publicKey,
  };
};
