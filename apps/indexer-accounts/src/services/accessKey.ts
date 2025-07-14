import {
  AccessKeyFunctionCallPermission,
  BlockHeader,
  Message,
  Receipt,
} from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import { AccessKey, AccessKeyPermissionKind, JsonValue } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isAddKeyAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isTransferAction,
} from '#libs/guards';
import {
  isExecutionSuccess,
  jsonStringify,
  publicKeyFromImplicitAccount,
} from '#libs/utils';

type AccessKeyMap = Map<string, AccessKey>;
type DeletedAccount = { accountId: string; receiptId: string };
type DeletedAccountMap = Map<string, DeletedAccount>;

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

export const storeAccessKeys = async (knex: Knex, message: Message) => {
  const accessKeys: AccessKeyMap = new Map();
  const accessKeysToUpdate: AccessKeyMap = new Map();
  const deletedAccounts: DeletedAccountMap = new Map();

  for (const shard of message.shards) {
    for (const outcome of shard.receiptExecutionOutcomes) {
      if (
        outcome.receipt &&
        isExecutionSuccess(outcome.executionOutcome.outcome.status)
      ) {
        getChunkAccessKeys(
          message.block.header,
          outcome.receipt,
          accessKeys,
          accessKeysToUpdate,
          deletedAccounts,
        );
      }
    }
  }

  if (accessKeys.size) {
    await retry(async () => {
      return knex('access_keys')
        .insert([...accessKeys.values()])
        .onConflict(['public_key', 'account_id'])
        .merge()
        .whereRaw(
          'access_keys.created_by_block_timestamp < EXCLUDED.created_by_block_timestamp',
        );
    });
  }

  if (accessKeysToUpdate.size) {
    await Promise.all(
      [...accessKeysToUpdate.values()].map(async (accessKey) => {
        return retry(async () => {
          return knex('access_keys')
            .update({
              deleted_by_block_timestamp: accessKey.deleted_by_block_timestamp,
              deleted_by_receipt_id: accessKey.deleted_by_receipt_id,
            })
            .where('public_key', accessKey.public_key)
            .where('account_id', accessKey.account_id)
            .where(
              'created_by_block_timestamp',
              '<=',
              accessKey.deleted_by_block_timestamp,
            )
            .andWhere(function () {
              this.whereNull('deleted_by_block_timestamp').orWhere(
                'deleted_by_block_timestamp',
                '<',
                accessKey.deleted_by_block_timestamp,
              );
            });
        });
      }),
    );
  }

  if (deletedAccounts.size) {
    await Promise.all(
      [...deletedAccounts.values()].map(async (deleted) => {
        return retry(async () => {
          return knex('access_keys')
            .update({
              deleted_by_block_timestamp: message.block.header.timestampNanosec,
              deleted_by_receipt_id: deleted.receiptId,
            })
            .where('account_id', deleted.accountId)
            .andWhere(function () {
              this.whereNull('deleted_by_block_timestamp').orWhere(
                'deleted_by_block_timestamp',
                '<',
                message.block.header.timestampNanosec,
              );
            });
        });
      }),
    );
  }
};

const getChunkAccessKeys = (
  block: BlockHeader,
  receipt: Receipt,
  accessKeys: AccessKeyMap,
  accessKeysToUpdate: AccessKeyMap,
  deletedAccounts: DeletedAccountMap,
) => {
  if (receipt?.receipt && 'Action' in receipt.receipt) {
    for (const action of receipt.receipt.Action.actions) {
      const receiptId = receipt.receiptId;
      const accountId = receipt.receiverId;

      if (isDeleteAccountAction(action)) {
        deletedAccounts.set(accountId, {
          accountId,
          receiptId,
        });

        continue;
      }

      if (isAddKeyAction(action)) {
        const { accessKey, publicKey } = action.AddKey;
        const mapKey = `${accountId}:${publicKey}`;
        const keyToUpdate = accessKeysToUpdate.get(mapKey);

        if (keyToUpdate) {
          accessKeysToUpdate.delete(mapKey);
        }

        accessKeys.set(
          mapKey,
          getAccessKeyData(
            accountId,
            publicKey,
            accessKey.permission,
            block.timestampNanosec,
            receiptId,
          ),
        );

        continue;
      }

      if (isDeleteKeyAction(action)) {
        const { publicKey } = action.DeleteKey;
        const mapKey = `${accountId}:${publicKey}`;
        const existingKey = accessKeys.get(mapKey);

        if (existingKey) {
          accessKeys.set(mapKey, {
            ...existingKey,
            deleted_by_block_timestamp: block.timestampNanosec,
            deleted_by_receipt_id: receiptId,
          });

          continue;
        }

        accessKeysToUpdate.set(
          mapKey,
          getAccessKeyData(
            accountId,
            publicKey,
            null,
            block.timestampNanosec,
            receiptId,
            block.timestampNanosec,
            receiptId,
          ),
        );

        continue;
      }

      if (isTransferAction(action) && accountId.length === 64) {
        const publicKey = publicKeyFromImplicitAccount(accountId);
        const mapKey = `${accountId}:${publicKey}`;

        if (publicKey) {
          accessKeys.set(
            mapKey,
            getAccessKeyData(
              accountId,
              publicKey,
              AccessKeyPermissionKind.FULL_ACCESS,
              block.timestampNanosec,
              receiptId,
            ),
          );

          continue;
        }
      }
    }
  }
};

export const getAccessKeyData = (
  account: string,
  publicKey: string,
  permission: AccessKeyFunctionCallPermission | null | string,
  blockTimestamp: string,
  receiptId: null | string = null,
  deletedBlockTimestamp: null | string = null,
  deletedReceiptId: null | string = null,
): AccessKey => {
  let permissions: JsonValue | null = null;
  let permissionKind = AccessKeyPermissionKind.FULL_ACCESS;

  if (permission && typeof permission !== 'string') {
    permissions = jsonStringify(permission.FunctionCall);
    permissionKind = AccessKeyPermissionKind.FUNCTION_CALL;
  }

  return {
    account_id: account,
    created_by_block_timestamp: blockTimestamp,
    created_by_receipt_id: receiptId,
    deleted_by_block_timestamp: deletedBlockTimestamp,
    deleted_by_receipt_id: deletedReceiptId,
    permission: permissions,
    permission_kind: permissionKind,
    public_key: publicKey,
  };
};
