import { Knex } from 'nb-knex';
import {
  AccessKeyFunctionCallPermission,
  BlockHeader,
  Message,
  Receipt,
} from 'nb-neardata';
import { AccessKey, AccessKeyPermissionKind, JsonValue } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import {
  isAddKeyAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isTransferAction,
} from '#libs/guards';
import { keyHistogram } from '#libs/prom';
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
  const start = performance.now();
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
      await knex('access_keys')
        .insert([...accessKeys.values()])
        .onConflict(['public_key', 'account_id'])
        .merge();
    });
  }

  if (accessKeysToUpdate.size) {
    await Promise.all(
      [...accessKeysToUpdate.values()].map(async (accessKey) => {
        await retry(async () => {
          await knex('access_keys')
            .update({
              deleted_by_block_height: accessKey.deleted_by_block_height,
              deleted_by_receipt_id: accessKey.deleted_by_receipt_id,
            })
            .where('public_key', accessKey.public_key)
            .where('account_id', accessKey.account_id)
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }

  if (deletedAccounts.size) {
    await Promise.all(
      [...deletedAccounts.values()].map(async (deleted) => {
        await retry(async () => {
          await knex('access_keys')
            .update({
              deleted_by_block_height: message.block.header.height,
              deleted_by_receipt_id: deleted.receiptId,
            })
            .where('account_id', deleted.accountId)
            .whereNull('deleted_by_block_height');
        });
      }),
    );
  }

  keyHistogram.labels(config.network).observe(performance.now() - start);
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
            block.height,
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
            deleted_by_block_height: block.height,
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
            block.height,
            receiptId,
            block.height,
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
              block.height,
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
  blockHeight: number,
  receiptId: null | string = null,
  deletedBlockHeight: null | number = null,
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
    created_by_block_height: blockHeight,
    created_by_receipt_id: receiptId,
    deleted_by_block_height: deletedBlockHeight,
    deleted_by_receipt_id: deletedReceiptId,
    permission: permissions,
    permission_kind: permissionKind,
    public_key: publicKey,
  };
};
