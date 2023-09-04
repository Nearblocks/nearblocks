import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import retry from '#libs/retry';
import { AccessKey } from '#ts/types';
import { AccessKeyPermissionKind } from '#ts/enums';
import { publicKeyFromImplicitAccount } from '#libs/utils';
import {
  isAddKeyAction,
  isTransferAction,
  isDeleteKeyAction,
  isDeleteAccountAction,
} from '#libs/guards';

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
    public_key: publicKey,
    account_id: account,
    created_by_receipt_id: null,
    deleted_by_receipt_id: null,
    permission_kind: permissionKind,
    last_update_block_height: blockHeight,
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
        shard.receiptExecutionOutcomes,
        message.block.header.height,
      );
    }),
  );
};

export const storeChunkAccessKeys = async (
  knex: Knex,
  outcomes: types.ExecutionOutcomeWithReceipt[],
  blockHeight: number,
) => {
  if (!outcomes.length) return;

  const accessKeys: AccessKeyMap = new Map();
  const deletedAccounts: DeletedAccountMap = new Map();

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

        if (isDeleteAccountAction(action)) {
          deletedAccounts.set(accountId, {
            accountId,
            receiptId,
          });
          accessKeys.forEach((value, key) => {
            accessKeys.set(key, {
              ...value,
              deleted_by_receipt_id: receiptId,
            });
          });
          return;
        }

        if (isAddKeyAction(action)) {
          const { accessKey, publicKey } = action.AddKey;

          return accessKeys.set(
            `${accountId}:${publicKey}`,
            getAccessKeyData(
              blockHeight,
              accountId,
              publicKey,
              accessKey.permission,
              receiptId,
            ),
          );
        }

        if (isDeleteKeyAction(action)) {
          const { publicKey } = action.DeleteKey;

          if (accessKeys.has(`${accountId}:${publicKey}`)) {
            return accessKeys.set(
              `${accountId}:${publicKey}`,
              getAccessKeyData(
                blockHeight,
                accountId,
                publicKey,
                AccessKeyPermissionKind.FULL_ACCESS,
                receiptId,
                receiptId,
              ),
            );
          }

          return accessKeys.set(
            `${accountId}:${publicKey}`,
            getAccessKeyData(
              blockHeight,
              accountId,
              publicKey,
              AccessKeyPermissionKind.FULL_ACCESS,
              null,
              receiptId,
            ),
          );
        }

        if (isTransferAction(action) && accountId.length === 64) {
          const publicKey = publicKeyFromImplicitAccount(accountId);

          if (publicKey) {
            return accessKeys.set(
              `${accountId}:${publicKey}`,
              getAccessKeyData(
                blockHeight,
                accountId,
                publicKey,
                AccessKeyPermissionKind.FULL_ACCESS,
                receiptId,
              ),
            );
          }
        }

        return;
      });
    }
  });

  if (deletedAccounts.size) {
    await Promise.all(
      [...deletedAccounts.values()].map(async (accessKey) => {
        await retry(async () => {
          await knex('access_keys')
            .where('account_id', accessKey.accountId)
            .whereNull('deleted_by_receipt_id')
            .where('last_update_block_height', '<', blockHeight)
            .update({
              deleted_by_receipt_id: accessKey.receiptId,
              last_update_block_height: blockHeight,
            });
        });
      }),
    );
  }

  if (accessKeys.size) {
    await retry(async () => {
      await knex('access_keys')
        .insert([...accessKeys.values()])
        .onConflict(['public_key', 'account_id'])
        .merge([
          'created_by_receipt_id',
          'deleted_by_receipt_id',
          'last_update_block_height',
        ]);
    });
  }
};

const getAccessKeyData = (
  blockHeight: number,
  account: string,
  publicKey: string,
  permission: string | types.AccessKeyFunctionCallPermission,
  receipt: string | null,
  deletedReceipt: string | null = null,
): AccessKey => {
  const permissionKind =
    typeof permission === 'string'
      ? AccessKeyPermissionKind.FULL_ACCESS
      : AccessKeyPermissionKind.FUNCTION_CALL;

  return {
    public_key: publicKey,
    account_id: account,
    created_by_receipt_id: receipt,
    deleted_by_receipt_id: deletedReceipt,
    permission_kind: permissionKind,
    last_update_block_height: blockHeight,
  };
};
