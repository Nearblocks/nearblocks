import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Knex } from 'nb-knex';

import { startTestDb } from './test-db.js';
import { implicitPublicKey, oneBlockMessage } from './test-helpers.js';

let db: Knex;
let container: Awaited<ReturnType<typeof startTestDb>>['container'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeAccessKeys: any;

beforeAll(async () => {
  ({ container, db } = await startTestDb());
  ({ storeAccessKeys } = await import('./accessKey.js'));
});

afterAll(async () => {
  await db?.destroy();
  await container?.stop();
});

describe('storeAccessKeys', () => {
  it('records a plain AddKey', async () => {
    const message = oneBlockMessage([
      {
        actions: [
          {
            AddKey: {
              accessKey: { nonce: 0, permission: 'FullAccess' },
              publicKey: 'ed25519:add',
            },
          },
        ],
        receiptId: 'r1',
        receiverId: 'add-only.near',
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: 'add-only.near', public_key: 'ed25519:add' })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
    expect(row?.created_by_receipt_id).toBe('r1');
  });

  it('records a DeleteKey against a pre-existing key', async () => {
    await db('access_keys').insert({
      account_id: 'delete-only.near',
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: 'ed25519:delete-only',
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteKey: { publicKey: 'ed25519:delete-only' } }],
        receiptId: 'r2',
        receiverId: 'delete-only.near',
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({
        account_id: 'delete-only.near',
        public_key: 'ed25519:delete-only',
      })
      .first();

    expect(row?.deleted_by_receipt_id).toBe('r2');
  });

  it('does not leave a key marked deleted after a same-block DeleteKey -> AddKey', async () => {
    await db('access_keys').insert({
      account_id: 'delete-then-add.near',
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: 'ed25519:key',
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteKey: { publicKey: 'ed25519:key' } }],
        receiptId: 'del',
        receiverId: 'delete-then-add.near',
      },
      {
        actions: [
          {
            AddKey: {
              accessKey: { nonce: 0, permission: 'FullAccess' },
              publicKey: 'ed25519:key',
            },
          },
        ],
        receiptId: 'add',
        receiverId: 'delete-then-add.near',
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: 'delete-then-add.near', public_key: 'ed25519:key' })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
    expect(row?.created_by_receipt_id).toBe('genesis');
  });

  it('does not leave a pre-existing key marked deleted after a same-block DeleteAccount-sweep -> Transfer', async () => {
    const acct = '3'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    await db('accounts').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
    });
    await db('access_keys').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: pubkey,
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'del',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'transfer',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
  });

  it('keeps a pre-existing key deleted after a same-block direct DeleteKey -> Transfer (account not recreated)', async () => {
    // A Transfer to an implicit account that already exists on-chain does not
    // recreate its access key: only a DeleteAccount -> Transfer (the account
    // itself being recreated) restores it. A bare DeleteKey -> Transfer must
    // leave the key deleted.
    const acct = '4'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    await db('access_keys').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: pubkey,
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteKey: { publicKey: pubkey } }],
        receiptId: 'del',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'transfer',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();

    expect(row?.deleted_by_block_timestamp).not.toBeNull();
    expect(row?.deleted_by_receipt_id).toBe('del');
  });

  it('restores a key after a same-block DeleteKey -> DeleteAccount -> Transfer (account recreated)', async () => {
    const acct = '7'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    await db('access_keys').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: pubkey,
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteKey: { publicKey: pubkey } }],
        receiptId: 'del-key',
        receiverId: acct,
      },
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'del-acct',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'transfer',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();

    // The DeleteKey was cancelled in-memory before its update ever reached the
    // DB, so the row's deleted_by_block_timestamp was never actually set. The
    // implicitKeys restore-UPDATE only fires when the DB row is currently
    // marked deleted, so it no-ops here and created_by_receipt_id stays stale
    // (same accepted lineage trade-off as C5). Only aliveness is guaranteed.
    expect(row?.deleted_by_block_timestamp).toBeNull();
  });

  it('sweeps a deleted account down to only its recreated implicit key, leaving other keys deleted', async () => {
    const acct = '8'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    await db('access_keys').insert([
      {
        account_id: acct,
        created_by_block_timestamp: '1',
        created_by_receipt_id: 'genesis',
        permission_kind: 'FULL_ACCESS',
        public_key: pubkey,
      },
      {
        account_id: acct,
        created_by_block_timestamp: '1',
        created_by_receipt_id: 'genesis-extra',
        permission_kind: 'FULL_ACCESS',
        public_key: 'ed25519:extra',
      },
    ]);

    const message = oneBlockMessage([
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'del',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'transfer',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const implicit = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();
    const extra = await db('access_keys')
      .where({ account_id: acct, public_key: 'ed25519:extra' })
      .first();

    expect(implicit?.deleted_by_block_timestamp).toBeNull();
    expect(extra?.deleted_by_block_timestamp).not.toBeNull();
    expect(extra?.deleted_by_receipt_id).toBe('del');
  });

  it('does not sweep away an AddKey issued after a same-block DeleteAccount', async () => {
    const acct = 'add-after-delete.near';

    await db('access_keys').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      permission_kind: 'FULL_ACCESS',
      public_key: 'ed25519:old',
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'del',
        receiverId: acct,
      },
      {
        actions: [
          {
            AddKey: {
              accessKey: { nonce: 0, permission: 'FullAccess' },
              publicKey: 'ed25519:new',
            },
          },
        ],
        receiptId: 'add',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const oldKey = await db('access_keys')
      .where({ account_id: acct, public_key: 'ed25519:old' })
      .first();
    const newKey = await db('access_keys')
      .where({ account_id: acct, public_key: 'ed25519:new' })
      .first();

    expect(oldKey?.deleted_by_block_timestamp).not.toBeNull();
    expect(newKey?.deleted_by_block_timestamp).toBeNull();
    expect(newKey?.created_by_receipt_id).toBe('add');
  });

  it('fully restores a brand-new implicit key across Transfer -> DeleteKey(merge) -> Transfer in one block', async () => {
    const acct = '5'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    const message = oneBlockMessage([
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 't1',
        receiverId: acct,
      },
      {
        actions: [{ DeleteKey: { publicKey: pubkey } }],
        receiptId: 'del',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 't2',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
    expect(row?.created_by_receipt_id).toBe('t2');
  });

  it('restores an already-deleted implicit key once the account has been recreated with a matching receipt', async () => {
    const acct = '6'.repeat(64);
    const pubkey = implicitPublicKey(acct);

    await db('accounts').insert({
      account_id: acct,
      created_by_block_timestamp: '3',
      created_by_receipt_id: 'restore-transfer',
    });
    await db('access_keys').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
      deleted_by_block_timestamp: '2',
      deleted_by_receipt_id: 'old-delete',
      permission_kind: 'FULL_ACCESS',
      public_key: pubkey,
    });

    const message = oneBlockMessage([
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'restore-transfer',
        receiverId: acct,
      },
    ]);

    await storeAccessKeys(db, message);

    const row = await db('access_keys')
      .where({ account_id: acct, public_key: pubkey })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
    expect(row?.created_by_receipt_id).toBe('restore-transfer');
  });
});
