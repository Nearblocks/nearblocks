import { Response } from 'express';

import type { AccessKey } from 'nb-schemas';

import catchAsync from '#libs/async';
import { dbBase } from '#libs/pgp';
import { toNumber } from '#libs/proxy';
import { Item } from '#libs/schema/keys';
import sql from '#sql/keys';
import { RequestValidator } from '#types/types';

// v1 access-key lookup served by reusing the shared v3 keys query (#sql/keys)
// against the split DBs and reformatting the rows into the legacy v1 JSON
// shape. No v3 service file is imported or modified. The query orchestration
// mirrors services/v3/keys, except that the v1 endpoint is unpaginated, so the
// proxy walks the v3 keyset cursor instead of serving a single page.

// v3's per-request maximum; used as the page size while walking.
const PAGE_SIZE = 100;
// Safety bound on the walk: a public key shared by more than PAGE_SIZE *
// MAX_PAGES accounts is truncated rather than paged forever.
const MAX_PAGES = 10;

type KeyCursor = { account: string; timestamp: string };

const timestamp = (value: string | undefined) =>
  value === undefined || value === null ? null : toNumber(value);

/**
 * GET /v1/keys/{key}
 *
 * Non-1:1:
 * - v1 returned **all** access keys for the public key, including deleted ones;
 *   the v3 query filters `deleted_by_block_timestamp IS NULL`, so deleted keys
 *   are gone and the `deleted` object is therefore always
 *   `{ block_timestamp: null, transaction_hash: null }` (the key is kept so v1
 *   clients that index into it do not break).
 * - v1 was unpaginated; the v3 query pages on (`action_timestamp`,
 *   `account_id`). The proxy walks that cursor to reproduce the full list, but
 *   caps the walk at MAX_PAGES * PAGE_SIZE (1000) keys.
 * - The nested v3 `created.block` / `deleted.block` object is flattened back to
 *   the v1 `{ transaction_hash, block_timestamp }` pair; `block_hash` /
 *   `block_height` are dropped (v1 never had them) and `block_timestamp` is
 *   coerced from the v3 string to a JSON number, matching v1's uncast
 *   `JSON_BUILD_OBJECT` output (including its precision loss above 2^53).
 * - The v3 extras `action_timestamp` and `permission` are not emitted.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const key = req.validator.data.key;
  const rows: AccessKey[] = [];
  let cursor: KeyCursor | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch: AccessKey[] = await dbBase.manyOrNone<AccessKey>(sql.keys, {
      cursor: {
        account: cursor?.account ?? null,
        timestamp: cursor?.timestamp ?? null,
      },
      key,
      limit: PAGE_SIZE,
    });

    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;

    const last = batch[batch.length - 1];

    cursor = { account: last.account_id, timestamp: last.action_timestamp };
  }

  const keys = rows.map((row) => ({
    account_id: row.account_id,
    created: {
      block_timestamp: timestamp(row.created?.block?.block_timestamp),
      transaction_hash: row.created?.transaction_hash ?? null,
    },
    deleted: {
      block_timestamp: timestamp(row.deleted?.block?.block_timestamp),
      transaction_hash: row.deleted?.transaction_hash ?? null,
    },
    permission_kind: row.permission_kind,
    public_key: row.public_key,
  }));

  return res.status(200).json({ keys });
});

export default { item };
