## Prerequisites

1. **API** — replace the search query in
   `apps/api/src/sql/queries/search/accounts.sql` (old query references the
   `search` column and would error post-swap). Target query (note: `_` is a
   LIKE single-char wildcard and is legal in account ids — must be escaped):

   ```sql
   SELECT account_id FROM accounts
   WHERE account_id LIKE REPLACE(${account}, '_', '\_') || '%'
   ORDER BY
     (account_id = ${account}) DESC,
     (account_id LIKE REPLACE(${account}, '_', '\_') || '.%') DESC,
     LENGTH(account_id) ASC,
     account_id ASC
   LIMIT 5
   ```

   Safe to deploy ahead of time — it only needs `account_id`, so it works
   against the old table too (and instantly fixes the never-backfilled
   `search = NULL` rows being unsearchable).

2. **Base migration** — create `public.update_account_parent()` (parent-only
   trigger function; body identical to `rebuild.update_account_parent()` in
   `schema.sql`): `swap.sql` re-points the table trigger at it. The same
   migration can drop the old search machinery from the pre-swap table and
   add the prefix index there if desired.

## Procedure

1. Build the image from `backfill-accounts`.
2. Run `rebuild/schema.sql` on the target database.
3. Start the backfill service. The live accounts indexer keeps running untouched.
4. `syncGenesis()` seeds `rebuild.accounts` / `rebuild.access_keys` , then the backfill walks to the tip. Monitor:

   ```sql
   SELECT
     value
   FROM
     rebuild.settings
   WHERE
     key = 'accounts';
   
   -- backfill cursor
   SELECT
     value
   FROM
     public.settings
   WHERE
     key = 'accounts';
   
   -- live cursor
   ```

5. When lag is small, run the validation queries below. Expected diffs are
   exactly the corruption classes the fix addresses (inflated
   `created_by_block_timestamp` on live rows, resurrected deleted keys).
6. Cutover:
   1. stop the live accounts indexer and the backfill container;
   2. run `rebuild/swap.sql` (atomic; also copies the cursor to
      `public.settings`);
   3. start the live accounts indexer (main-branch image, default
      `DATABASE_SCHEMA`) — it resumes streaming from the rebuilt tip;
   4. decommission the backfill service.
7. Keep `legacy.*` for rollback (reverse of swap.sql). After a soak period:

   ```sql
   DROP SCHEMA legacy CASCADE;
   
   DROP SCHEMA rebuild CASCADE;
   ```

## Validation queries

```sql
-- volume sanity
SELECT
  (
    SELECT
      COUNT(*)
    FROM
      public.accounts
  ) AS live_accounts,
  (
    SELECT
      COUNT(*)
    FROM
      rebuild.accounts
  ) AS rebuilt_accounts,
  (
    SELECT
      COUNT(*)
    FROM
      public.access_keys
  ) AS live_keys,
  (
    SELECT
      COUNT(*)
    FROM
      rebuild.access_keys
  ) AS rebuilt_keys;

-- accounts diff (run with count(*) first, then inspect samples)
SELECT
  COALESCE(p.account_id, r.account_id) AS account_id,
  p.created_by_block_timestamp AS live_created,
  r.created_by_block_timestamp AS rb_created,
  p.deleted_by_block_timestamp AS live_deleted,
  r.deleted_by_block_timestamp AS rb_deleted
FROM
  public.accounts p
  FULL JOIN rebuild.accounts r USING (account_id)
WHERE
  p.account_id IS NULL
  OR r.account_id IS NULL
  OR p.created_by_block_timestamp IS DISTINCT FROM r.created_by_block_timestamp
  OR p.deleted_by_block_timestamp IS DISTINCT FROM r.deleted_by_block_timestamp
  OR p.created_by_receipt_id IS DISTINCT FROM r.created_by_receipt_id
  OR p.deleted_by_receipt_id IS DISTINCT FROM r.deleted_by_receipt_id
LIMIT
  1000;

-- access_keys diff
SELECT
  COALESCE(p.account_id, r.account_id) AS account_id,
  COALESCE(p.public_key, r.public_key) AS public_key,
  p.created_by_block_timestamp AS live_created,
  r.created_by_block_timestamp AS rb_created,
  p.deleted_by_block_timestamp AS live_deleted,
  r.deleted_by_block_timestamp AS rb_deleted
FROM
  public.access_keys p
  FULL JOIN rebuild.access_keys r USING (public_key, account_id)
WHERE
  p.account_id IS NULL
  OR r.account_id IS NULL
  OR p.created_by_block_timestamp IS DISTINCT FROM r.created_by_block_timestamp
  OR p.deleted_by_block_timestamp IS DISTINCT FROM r.deleted_by_block_timestamp
  OR p.created_by_receipt_id IS DISTINCT FROM r.created_by_receipt_id
  OR p.deleted_by_receipt_id IS DISTINCT FROM r.deleted_by_receipt_id
  OR p.permission_kind IS DISTINCT FROM r.permission_kind
  OR p.permission IS DISTINCT FROM r.permission
LIMIT
  1000;
```
