import { types } from 'near-lake-framework';

import { AccessKey, AccessKeyPermissionKind } from 'nb-types';

import {
  isAddKeyAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isTransferAction,
} from '#libs/guards';
import { accessKeyColumns, pgp } from '#libs/pgp';
import { publicKeyFromImplicitAccount } from '#libs/utils';
import { PgpQuery } from '#types/types';

type AccessKeyMap = Map<string, AccessKey>;
type DeletedAccount = { accountId: string; receiptId: string };
type DeletedAccountMap = Map<string, DeletedAccount>;

export const storeAccessKeys = async (message: types.StreamerMessage) => {
  let accessKeys: AccessKey[] = [];
  let accessKeysToUpdate: AccessKey[] = [];
  let deletedAccounts: DeletedAccount[] = [];

  await Promise.all(
    message.shards.map(async (shard) => {
      const chunks = storeChunkAccessKeys(
        message.block.header,
        shard.receiptExecutionOutcomes,
      );

      accessKeys = accessKeys.concat(chunks?.accessKeys ?? []);
      accessKeysToUpdate = accessKeysToUpdate.concat(
        chunks?.accessKeysToUpdate ?? [],
      );
      deletedAccounts = deletedAccounts.concat(chunks?.deletedAccounts ?? []);
    }),
  );

  let queries: PgpQuery[] = [];

  if (deletedAccounts.length) {
    queries = queries.concat(
      deletedAccounts.map((key) => {
        return {
          query: `
            UPDATE access_keys
            SET deleted_by_receipt_id = $1,
                deleted_by_block_height = $2
            WHERE account_id = $3
              AND created_by_block_height < $4
              AND deleted_by_block_height IS NULL;
          `,
          values: [
            key.receiptId,
            message.block.header.height,
            key.accountId,
            message.block.header.height,
          ],
        };
      }),
    );
  }

  if (accessKeys.length) {
    queries.push(
      pgp.helpers.insert(accessKeys, accessKeyColumns) +
        ' ON CONFLICT (public_key, account_id) DO NOTHING',
    );
  }

  if (accessKeysToUpdate.length) {
    queries = queries.concat(
      accessKeysToUpdate.map((key) => {
        return {
          query: `
            UPDATE access_keys
            SET
              deleted_by_receipt_id = $1,
              deleted_by_block_height = $2
            WHERE
              account_id = $3
              AND public_key = $4
              AND created_by_block_height < $5
              AND deleted_by_block_height IS NULL;
          `,
          values: [
            key.deleted_by_receipt_id,
            key.deleted_by_block_height,
            key.account_id,
            key.public_key,
            key.deleted_by_block_height,
          ],
        };
      }),
    );
  }

  return queries;
};

export const storeChunkAccessKeys = (
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

  return {
    accessKeys: [...accessKeys.values()],
    accessKeysToUpdate: [...accessKeysToUpdate.values()],
    deletedAccounts: [...deletedAccounts.values()],
  };
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
