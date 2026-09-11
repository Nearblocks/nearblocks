import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Knex } from 'nb-knex';

import { startTestDb } from './test-db.js';
import { oneBlockMessage } from './test-helpers.js';

let db: Knex;
let container: Awaited<ReturnType<typeof startTestDb>>['container'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeAccounts: any;

beforeAll(async () => {
  ({ container, db } = await startTestDb());
  ({ storeAccounts } = await import('./account.js'));
});

afterAll(async () => {
  await db?.destroy();
  await container?.stop();
});

describe('storeAccounts', () => {
  it('records a plain CreateAccount', async () => {
    const message = oneBlockMessage([
      {
        actions: ['CreateAccount'],
        receiptId: 'r1',
        receiverId: 'create-only.near',
      },
    ]);

    await storeAccounts(db, message);

    const row = await db('accounts')
      .where({ account_id: 'create-only.near' })
      .first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
    expect(row?.created_by_receipt_id).toBe('r1');
  });

  it('records a DeleteAccount against a pre-existing account', async () => {
    await db('accounts').insert({
      account_id: 'delete-only.near',
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'r2',
        receiverId: 'delete-only.near',
      },
    ]);

    await storeAccounts(db, message);

    const row = await db('accounts')
      .where({ account_id: 'delete-only.near' })
      .first();

    expect(row?.deleted_by_receipt_id).toBe('r2');
    expect(row?.created_by_receipt_id).toBe('genesis');
  });

  it('creates then deletes a brand-new account within the same block without resurrecting it', async () => {
    // Regression test: an earlier fix attempt unconditionally re-ran the
    // accounts insert after the delete-update, which could re-apply the
    // stale CreateAccount data (deleted_by_block_timestamp: null) and
    // silently undo a legitimate same-block delete, because the create and
    // delete share the exact same block timestamp.
    const message = oneBlockMessage([
      {
        actions: ['CreateAccount'],
        receiptId: 'r3',
        receiverId: 'create-then-delete.near',
      },
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'r4',
        receiverId: 'create-then-delete.near',
      },
    ]);

    await storeAccounts(db, message);

    const row = await db('accounts')
      .where({ account_id: 'create-then-delete.near' })
      .first();

    expect(row).toBeDefined();
    expect(row?.created_by_receipt_id).toBe('r3');
    expect(row?.deleted_by_receipt_id).toBe('r4');
  });

  it('keeps the first of two same-block transfers to a new implicit account', async () => {
    const acct = '1'.repeat(64);
    const message = oneBlockMessage([
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'first',
        receiverId: acct,
      },
      {
        actions: [{ Transfer: { deposit: '1' } }],
        receiptId: 'second',
        receiverId: acct,
      },
    ]);

    await storeAccounts(db, message);

    const row = await db('accounts').where({ account_id: acct }).first();

    expect(row?.created_by_receipt_id).toBe('first');
  });

  it('does not leave an account marked deleted after a same-block DeleteAccount -> CreateAccount', async () => {
    // On-chain, DeleteAccount frees the account id immediately within the
    // same block, so a later receipt in that block can validly recreate it
    // via CreateAccount (unlike creating an account that already existed at
    // the start of the block, which hard-fails).
    await db('accounts').insert({
      account_id: 'delete-then-create.near',
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
    });

    const message = oneBlockMessage([
      {
        actions: [{ DeleteAccount: { beneficiaryId: 'x.near' } }],
        receiptId: 'del',
        receiverId: 'delete-then-create.near',
      },
      {
        actions: ['CreateAccount'],
        receiptId: 'recreate',
        receiverId: 'delete-then-create.near',
      },
    ]);

    await storeAccounts(db, message);

    const row = await db('accounts')
      .where({ account_id: 'delete-then-create.near' })
      .first();

    // The DeleteAccount update was cancelled in-memory before it ever reached
    // the DB, so the row's deleted_by_block_timestamp was never actually set,
    // and the CreateAccount insert's merge guard (which only overwrites a row
    // it sees as deleted) no-ops. created_by_receipt_id stays stale (same
    // accepted lineage trade-off noted elsewhere) — only aliveness is
    // guaranteed here.
    expect(row?.deleted_by_block_timestamp).toBeNull();
  });

  it('does not leave a pre-existing account marked deleted after a same-block DeleteAccount -> Transfer', async () => {
    const acct = '2'.repeat(64);

    await db('accounts').insert({
      account_id: acct,
      created_by_block_timestamp: '1',
      created_by_receipt_id: 'genesis',
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

    await storeAccounts(db, message);

    const row = await db('accounts').where({ account_id: acct }).first();

    expect(row?.deleted_by_block_timestamp).toBeNull();
  });
});
