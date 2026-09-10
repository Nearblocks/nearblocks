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
import { tbl } from '#libs/knex';
import {
  isExecutionSuccess,
  jsonStringify,
  normalizePublicKey,
  publicKeyFromImplicitAccount,
} from '#libs/utils';

export type AccessKeyMap = Map<string, AccessKey>;
export type DeletedAccount = {
  accountId: string;
  blockTimestamp: string;
  receiptId: string;
};
export type DeletedAccountMap = Map<string, DeletedAccount>;

export const storeGenesisAccessKeys = async (
  knex: Knex,
  accessKeys: AccessKey[],
) => {
  await retry(async () => {
    await knex(tbl('access_keys'))
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

  collectAccessKeys(
    message,
    accessKeys,
    implicitKeys,
    accessKeysToUpdate,
    deletedAccounts,
  );
  await flushAccessKeys(
    knex,
    accessKeys,
    implicitKeys,
    accessKeysToUpdate,
    deletedAccounts,
  );
};

export const collectAccessKeys = (
  message: Message,
  accessKeys: AccessKeyMap,
  implicitKeys: AccessKeyMap,
  accessKeysToUpdate: AccessKeyMap,
  deletedAccounts: DeletedAccountMap,
) => {
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
};

const insertAccessKeys = async (knex: Knex, accessKeys: AccessKeyMap) => {
  if (!accessKeys.size) {
    return;
  }

  const rows = [...accessKeys.values()];

  for (let i = 0; i < rows.length; i += config.insertLimit) {
    const batch = rows.slice(i, i + config.insertLimit);

    await retry(async () => {
      return knex(tbl('access_keys'))
        .insert(batch)
        .onConflict(['public_key', 'account_id'])
        .merge()
        .whereRaw(
          'access_keys.deleted_by_block_timestamp IS NOT NULL AND access_keys.deleted_by_block_timestamp <= EXCLUDED.created_by_block_timestamp',
        );
    });
  }
};

const insertImplicitKeys = async (knex: Knex, implicitKeys: AccessKeyMap) => {
  if (!implicitKeys.size) {
    return;
  }

  const rows = [...implicitKeys.values()];

  for (let i = 0; i < rows.length; i += config.insertLimit) {
    const batch = rows.slice(i, i + config.insertLimit);

    await retry(async () => {
      return knex(tbl('access_keys'))
        .insert(batch)
        .onConflict(['public_key', 'account_id'])
        .ignore();
    });
  }

  const updateRows = rows.map((accessKey) => ({
    account_id: accessKey.account_id,
    created_by_block_timestamp: accessKey.created_by_block_timestamp,
    created_by_receipt_id: accessKey.created_by_receipt_id,
    permission: accessKey.permission as null | string,
    permission_kind: accessKey.permission_kind,
    public_key: accessKey.public_key,
  }));

  for (let i = 0; i < updateRows.length; i += config.insertLimit) {
    const batch = updateRows.slice(i, i + config.insertLimit);

    await retry(async () => {
      return knex.raw(
        `
          UPDATE ${tbl('access_keys')} k
          SET
            created_by_block_timestamp = v.created_by_block_timestamp,
            created_by_receipt_id = v.created_by_receipt_id,
            deleted_by_block_timestamp = NULL,
            deleted_by_receipt_id = NULL,
            permission = v.permission::jsonb,
            permission_kind = v.permission_kind
          FROM jsonb_to_recordset(:rows) AS v(
            public_key text,
            account_id text,
            created_by_block_timestamp bigint,
            created_by_receipt_id text,
            permission text,
            permission_kind text
          )
          WHERE k.public_key = v.public_key
            AND k.account_id = v.account_id
            AND k.deleted_by_block_timestamp IS NOT NULL
            AND k.deleted_by_block_timestamp <= v.created_by_block_timestamp
            AND EXISTS (
              SELECT 1 FROM ${tbl('accounts')} a
              WHERE a.account_id = v.account_id
                AND a.created_by_receipt_id = v.created_by_receipt_id
            )
        `,
        { rows: JSON.stringify(batch) },
      );
    });
  }
};

export const flushAccessKeys = async (
  knex: Knex,
  accessKeys: AccessKeyMap,
  implicitKeys: AccessKeyMap,
  accessKeysToUpdate: AccessKeyMap,
  deletedAccounts: DeletedAccountMap,
) => {
  await insertAccessKeys(knex, accessKeys);
  await insertImplicitKeys(knex, implicitKeys);

  if (accessKeysToUpdate.size) {
    const rows = [...accessKeysToUpdate.values()].map((accessKey) => ({
      account_id: accessKey.account_id,
      deleted_by_block_timestamp: accessKey.deleted_by_block_timestamp,
      deleted_by_receipt_id: accessKey.deleted_by_receipt_id,
      public_key: accessKey.public_key,
    }));

    for (let i = 0; i < rows.length; i += config.insertLimit) {
      const batch = rows.slice(i, i + config.insertLimit);

      await retry(async () => {
        return knex.raw(
          `
            UPDATE ${tbl('access_keys')} k
            SET
              deleted_by_block_timestamp = v.deleted_by_block_timestamp,
              deleted_by_receipt_id = v.deleted_by_receipt_id
            FROM jsonb_to_recordset(:rows) AS v(
              public_key text,
              account_id text,
              deleted_by_block_timestamp bigint,
              deleted_by_receipt_id text
            )
            WHERE k.public_key = v.public_key
              AND k.account_id = v.account_id
              AND k.created_by_block_timestamp <= v.deleted_by_block_timestamp
              AND (
                k.deleted_by_block_timestamp IS NULL
                OR k.deleted_by_block_timestamp < v.deleted_by_block_timestamp
              )
          `,
          { rows: JSON.stringify(batch) },
        );
      });
    }
  }

  if (deletedAccounts.size) {
    const rows = [...deletedAccounts.values()].map((deleted) => ({
      account_id: deleted.accountId,
      block_timestamp: deleted.blockTimestamp,
      receipt_id: deleted.receiptId,
    }));

    for (let i = 0; i < rows.length; i += config.insertLimit) {
      const batch = rows.slice(i, i + config.insertLimit);

      await retry(async () => {
        return knex.raw(
          `
            UPDATE ${tbl('access_keys')} k
            SET
              deleted_by_block_timestamp = v.block_timestamp,
              deleted_by_receipt_id = v.receipt_id
            FROM jsonb_to_recordset(:rows) AS v(
              account_id text,
              block_timestamp bigint,
              receipt_id text
            )
            WHERE k.account_id = v.account_id
              AND k.created_by_block_timestamp <= v.block_timestamp
              AND (
                k.deleted_by_block_timestamp IS NULL
                OR k.deleted_by_block_timestamp < v.block_timestamp
              )
          `,
          { rows: JSON.stringify(batch) },
        );
      });
    }
  }

  await insertAccessKeys(knex, accessKeys);
  await insertImplicitKeys(knex, implicitKeys);
};

const needsFreshImplicitEntry = (
  accessKeys: AccessKeyMap,
  implicitKeys: AccessKeyMap,
  deletedAccounts: DeletedAccountMap,
  accountId: string,
  mapKey: string,
): boolean => {
  const pending = accessKeys.get(mapKey) ?? implicitKeys.get(mapKey);

  if (!pending) {
    return true;
  }

  const createdTs = BigInt(pending.created_by_block_timestamp);
  const ownDeletedTs = pending.deleted_by_block_timestamp
    ? BigInt(pending.deleted_by_block_timestamp)
    : null;
  const sweepDeletedTs = deletedAccounts.get(accountId)?.blockTimestamp;
  const sweepTs = sweepDeletedTs ? BigInt(sweepDeletedTs) : null;
  const latestDeleteTs =
    ownDeletedTs && sweepTs
      ? ownDeletedTs > sweepTs
        ? ownDeletedTs
        : sweepTs
      : ownDeletedTs ?? sweepTs;

  return latestDeleteTs !== null && latestDeleteTs > createdTs;
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
          blockTimestamp: block.timestampNanosec,
          receiptId,
        });

        continue;
      }

      if (isAddKeyAction(action)) {
        const { accessKey } = action.AddKey;
        const publicKey = normalizePublicKey(action.AddKey.publicKey);
        const mapKey = `${accountId}:${publicKey}`;

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

        if (
          publicKey &&
          needsFreshImplicitEntry(
            accessKeys,
            implicitKeys,
            deletedAccounts,
            accountId,
            mapKey,
          )
        ) {
          accessKeys.delete(mapKey);
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
