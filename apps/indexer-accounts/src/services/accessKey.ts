import { Knex } from 'nb-knex';
import {
  AccessKeyFunctionCallPermission,
  BlockHeader,
  Message,
  Receipt,
} from 'nb-neardata';
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
  normalizePublicKey,
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
  const implicitKeys: AccessKeyMap = new Map();
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
          implicitKeys,
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
          'access_keys.deleted_by_block_timestamp IS NOT NULL AND access_keys.deleted_by_block_timestamp <= EXCLUDED.created_by_block_timestamp',
        );
    });
  }

  if (implicitKeys.size) {
    await retry(async () => {
      return knex('access_keys')
        .insert([...implicitKeys.values()])
        .onConflict(['public_key', 'account_id'])
        .ignore();
    });

    await Promise.all(
      [...implicitKeys.values()].map(async (accessKey) => {
        return retry(async () => {
          return knex('access_keys')
            .update({
              created_by_block_timestamp: accessKey.created_by_block_timestamp,
              created_by_receipt_id: accessKey.created_by_receipt_id,
              deleted_by_block_timestamp: null,
              deleted_by_receipt_id: null,
              permission: accessKey.permission,
              permission_kind: accessKey.permission_kind,
            })
            .where('public_key', accessKey.public_key)
            .where('account_id', accessKey.account_id)
            .whereNotNull('deleted_by_block_timestamp')
            .where(
              'deleted_by_block_timestamp',
              '<=',
              accessKey.created_by_block_timestamp,
            )
            .whereExists(function () {
              this.select('account_id')
                .from('accounts')
                .where('accounts.account_id', accessKey.account_id)
                .where(
                  'accounts.created_by_receipt_id',
                  accessKey.created_by_receipt_id,
                );
            });
        });
      }),
    );
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
  implicitKeys: AccessKeyMap,
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
        const { accessKey } = action.AddKey;
        const publicKey = normalizePublicKey(action.AddKey.publicKey);
        const mapKey = `${accountId}:${publicKey}`;
        const keyToUpdate = accessKeysToUpdate.get(mapKey);

        if (keyToUpdate) {
          accessKeysToUpdate.delete(mapKey);
        }

        implicitKeys.delete(mapKey);

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
        const publicKey = normalizePublicKey(action.DeleteKey.publicKey);
        const mapKey = `${accountId}:${publicKey}`;
        const existingKey = accessKeys.get(mapKey) ?? implicitKeys.get(mapKey);

        if (existingKey) {
          implicitKeys.delete(mapKey);
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

        if (publicKey && !accessKeys.has(mapKey)) {
          implicitKeys.set(
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
