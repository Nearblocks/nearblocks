import { unionWith } from 'es-toolkit';
import { Response } from 'express';

import type {
  Account,
  AccountBalance,
  AccountKey,
  Block,
  ContractDeployment,
} from 'nb-schemas';

import config from '#config';
import catchAsync from '#libs/async';
import { getProvider, viewCode } from '#libs/near';
import { dbBalance, dbBase, dbContract, pgp } from '#libs/pgp';
import { rejected } from '#libs/proxy';
import redis from '#libs/redis';
import { paginateData, rollingWindow, rollingWindowList } from '#libs/response';
import {
  Action,
  Contract,
  Deployments,
  Item,
  Keys,
  KeysCount,
} from '#libs/schema/account';
import { numberOrNull } from '#services/proxy/account-common';
import sql from '#sql/accounts';
import blocksSql from '#sql/blocks';
import { RequestValidator } from '#types/types';

// v1 `/account/{account}` core endpoints served by reusing the shared v3 account
// query modules (#sql/accounts + #libs/response) directly and reformatting to
// the legacy v1 JSON shape. No v3 service file is imported or modified; the
// query orchestration mirrors services/v3/accounts/{index,contract,keys}.
// See the per-handler notes below for the non-1:1 differences.

type Deployment = { block_timestamp: string; receipt_id: string };
type RpcCode = null | Record<string, unknown>;

const CODE_EXPIRY = 300; // 5 mins

/**
 * v3's queries/accounts/contracts/action.sql filters on `method` alone — it
 * carries no account predicate, so reusing it verbatim would answer with the
 * latest action of *any* contract exposing that method name. v1 scoped the
 * lookup to the contract, so the account predicate is re-added here; the rest of
 * the statement (columns, ordering, limit) mirrors the v3 query exactly.
 */
const actionQuery = `
  SELECT
    args
  FROM
    action_receipt_actions
  WHERE
    receipt_receiver_account_id = \${account}
    AND method = \${method}
  ORDER BY
    receipt_included_in_block_timestamp DESC,
    shard_id DESC,
    index_in_chunk DESC,
    index_in_action_receipt DESC
  LIMIT
    1
`;

/** v3 `{transaction_hash, block: {...}}` -> the flat legacy created/deleted pair. */
const legacyTxnRef = (ref?: {
  block?: { block_timestamp?: string };
  block_timestamp?: string;
  transaction_hash?: string;
}) => ({
  block_timestamp: numberOrNull(
    ref?.block?.block_timestamp ?? ref?.block_timestamp,
  ),
  transaction_hash: ref?.transaction_hash ?? null,
});

/**
 * GET /v1/account/{account}
 *
 * Merges the v3 account row (created/deleted), the v3 balance row and the v3
 * latest block, which is how v1 built this response from three queries.
 *
 * Non-1:1: legacy `locked` is the **staked amount** (v1 read
 * `balance_events.absolute_staked_amount`), so it maps to the balance row's
 * `amount_staked`, not to v3's boolean `locked`. `created`/`deleted`
 * `block_timestamp` was a JSON number in v1 and is coerced back from the v3
 * string. When the account or the balance row is missing, v1 omitted the
 * corresponding keys entirely; the proxy always emits them as `null`.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const account = req.validator.data.account;

  const latestBlock = () =>
    rollingWindowList<Block>(
      (start, end) =>
        dbBase.manyOrNone<Block>(blocksSql.blocks, {
          cursor: { timestamp: null },
          direction: 'desc',
          end,
          limit: 1,
          start,
        }),
      { limit: 1, start: config.baseStart },
    );

  const [accountRow, balanceRow, blocks] = await Promise.all([
    dbBase.oneOrNone<Account>(sql.account, { account }),
    dbBalance.oneOrNone<AccountBalance>(sql.balance, { account }),
    // Identical raw query + shape to the v3 blocks list, so the cache is shared.
    redis.cache<Block[]>('v3:blocks:latest:1', latestBlock, 5),
  ]);

  const block = blocks?.[0];

  return res.status(200).json({
    account: [
      {
        account_id: accountRow?.account_id ?? null,
        amount: balanceRow?.amount ?? null,
        block_hash: block?.block_hash ?? null,
        block_height: block?.block_height ?? null,
        created: legacyTxnRef(accountRow?.created),
        deleted: legacyTxnRef(accountRow?.deleted),
        locked: balanceRow?.amount_staked ?? null,
      },
    ],
  });
});

/**
 * GET /v1/account/{account}/contract
 *
 * The contract body still comes from the RPC `view_code` call v1 used (it is
 * DB-independent, and keeps `hash`/`block_height`/`block_hash` exactly as v1
 * emitted them). Only `locked` moves to a v3 source: v3's account query
 * computes the same "no live FULL_ACCESS key" predicate v1 ran against
 * `access_keys`, which in the split schema keys off `deleted_by_block_timestamp`
 * instead of `deleted_by_block_height`.
 *
 * Non-1:1: an account with no row in `accounts` reports `locked: true`, matching
 * v1's `COALESCE(..., TRUE)` over an empty key set.
 */
const contract = catchAsync(
  async (req: RequestValidator<Contract>, res: Response) => {
    const account = req.validator.data.account;
    const provider = getProvider();

    const [code, accountRow] = await Promise.all([
      redis.cache<RpcCode>(
        `contract:${account}:code`,
        async () => {
          try {
            return (await viewCode(provider, account)) as unknown as RpcCode;
          } catch (error) {
            return null;
          }
        },
        CODE_EXPIRY,
      ),
      dbBase.oneOrNone<Account>(sql.account, { account }),
    ]);

    if (!code) return res.status(200).json({ contract: [] });

    return res
      .status(200)
      .json({ contract: [{ ...code, locked: accountRow?.locked ?? true }] });
  },
);

/**
 * GET /v1/account/{account}/contract/deployments
 *
 * Mirrors services/v3/accounts/contract.deployments: two rolling-window probes
 * (first + last deployment) on the contract DB, then a UNION ALL of the per
 * receipt txn lookups on the base DB.
 *
 * Non-1:1: v3 nests the block under `block`, v1 emitted only the txn's
 * `block_timestamp`; v3's `predecessor_account_id` is renamed back to
 * `receipt_predecessor_account_id`. `block_timestamp` stays a string in both.
 */
const deployments = catchAsync(
  async (req: RequestValidator<Deployments>, res: Response) => {
    const account = req.validator.data.account;

    const first = await rollingWindow<Deployment>(
      (start, end) =>
        dbContract.oneOrNone<Deployment>(sql.contracts.deployments, {
          account,
          end,
          order: 'ASC',
          start,
        }),
      { start: config.baseStart },
    );

    const last = await rollingWindow<Deployment>(
      (start, end) =>
        dbContract.oneOrNone<Deployment>(sql.contracts.deployments, {
          account,
          end,
          order: 'DESC',
          start,
        }),
      { start: config.baseStart },
    );

    if (!first && !last) return res.status(200).json({ deployments: [] });

    const receipts =
      first && last
        ? unionWith([first], [last], (a, b) => a.receipt_id === b.receipt_id)
        : [(first ?? last) as Deployment];

    const unionQuery = receipts
      .map((receipt) => pgp.as.format(sql.contracts.deploymentTxn, receipt))
      .join('\nUNION ALL\n');

    const rows = await dbBase.manyOrNone<ContractDeployment>(unionQuery);

    const deployments = rows.map((row) => ({
      block_timestamp: row.block?.block_timestamp ?? null,
      receipt_predecessor_account_id: row.predecessor_account_id,
      transaction_hash: row.transaction_hash,
    }));

    return res.status(200).json({ deployments });
  },
);

/**
 * GET /v1/account/{account}/contract/{method}
 *
 * Non-1:1: v3 returns a single object, v1 an array — the row is wrapped (empty
 * array when there is no match). The statement is the v3 action query plus the
 * `receipt_receiver_account_id` predicate v3 dropped (see `actionQuery`).
 */
const action = catchAsync(
  async (req: RequestValidator<Action>, res: Response) => {
    const account = req.validator.data.account;
    const method = req.validator.data.method;

    const row = await dbBase.oneOrNone<{ args: unknown }>(actionQuery, {
      account,
      method,
    });

    return res.status(200).json({ action: row ? [row] : [] });
  },
);

/**
 * GET /v1/account/{account}/keys
 *
 * Non-1:1: `page`>1 and `order=asc` -> 422; `per_page` capped at 100. v1 had no
 * cursor on this endpoint and the legacy envelope carries none, so only the
 * first page is reachable — an account with more than 100 keys is truncated.
 * The v3 row nests created/deleted under `block`, which is flattened back to
 * v1's `{transaction_hash, block_timestamp}` (a JSON number in v1), and
 * `account_id` is re-injected from the request since v3 drops it from the row.
 */
const keys = catchAsync(async (req: RequestValidator<Keys>, res: Response) => {
  const data = req.validator.data;

  if (data.page > 1) return rejected(res, 'page');
  if (data.order === 'asc') return rejected(res, 'order');

  const limit = Math.min(data.per_page, 100);

  const rows = await dbBase.manyOrNone<AccountKey>(sql.keys.keys, {
    account: data.account,
    cursor: { key: undefined, timestamp: undefined },
    direction: 'desc',
    // Fetch one extra to drop the overflow row, mirroring the v3 service
    limit: limit + 1,
  });

  const page = paginateData(
    rows,
    limit,
    'desc',
    (key) => ({ key: key.public_key, timestamp: key.action_timestamp }),
    false,
  );

  const keys = (page.data ?? []).map((key) => ({
    account_id: data.account,
    created: legacyTxnRef(key.created),
    deleted: legacyTxnRef(key.deleted),
    permission_kind: key.permission_kind,
    public_key: key.public_key,
  }));

  return res.status(200).json({ keys });
});

/**
 * GET /v1/account/{account}/keys/count
 *
 * Faithful: v3 runs the same `COUNT(account_id)` over `access_keys`, and the
 * count stays a string in both.
 */
const keysCount = catchAsync(
  async (req: RequestValidator<KeysCount>, res: Response) => {
    const account = req.validator.data.account;

    const count = await dbBase.one<{ count: string }>(sql.keys.count, {
      account,
    });

    return res.status(200).json({ keys: [{ count: count.count }] });
  },
);

export default {
  action,
  contract,
  deployments,
  item,
  keys,
  keysCount,
};
