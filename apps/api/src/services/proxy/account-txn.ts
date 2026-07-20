import { Response } from 'express';
import { z } from 'zod';

import type { AccountReceipt, AccountTxn } from 'nb-schemas';
import receiptRequest from 'nb-schemas/dist/accounts/receipts/request.js';
import txnRequest from 'nb-schemas/dist/accounts/txns/request.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import { dbBase, pgp } from '#libs/pgp';
import { legacyCursor, proxyAsync, rejected, toNumber } from '#libs/proxy';
import {
  cappedCount,
  countFromCagg,
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import schema, {
  Receipts,
  ReceiptsCount,
  TxnsOnly,
  TxnsOnlyCount,
} from '#libs/schema/account';
import v2Schema, {
  Receipts as V2Receipts,
  ReceiptsCount as V2ReceiptsCount,
} from '#libs/schema/v2/account';
import {
  beforeTs,
  legacyCount,
  numberOrNull,
} from '#services/proxy/account-common';
import sql from '#sql/accounts';
import { RequestValidator } from '#types/types';

// v1 `/account/{account}/txns-only` + `/receipts` and v2
// `/account/{account}/receipts`, served by reusing the shared v3 account txn /
// receipt query modules (#sql/accounts + #libs/response) and reformatting to the
// legacy JSON shape. The orchestration mirrors services/v3/accounts/{txns,
// receipts}.

// The proxy emits the v3 opaque cursor; the legacy v1 schemas constrained
// `cursor` to the old numeric `transactions.id` / `receipts.id`.
const schemas = {
  receipts: schema.receipts.extend({ cursor: z.string().optional() }),
  txnsOnly: schema.txnsOnly.extend({ cursor: z.string().optional() }),
  v2Receipts: v2Schema.receipts.extend({ cursor: z.string().optional() }),
};

type V3Action = { action: string; method: null | string };

/** v1 emitted per-action `deposit`/`fee`/`args`; v3 list rows carry only action/method. */
const legacyActions = (actions?: V3Action[]) =>
  (actions ?? []).map((action) => ({
    action: action.action,
    args: null,
    deposit: null,
    fee: null,
    method: action.method,
  }));

/** v2 per-action rows carry `deposit`/`args` only (no `fee`). */
const legacyV2Actions = (actions?: V3Action[]) =>
  (actions ?? []).map((action) => ({
    action: action.action,
    args: null,
    deposit: null,
    method: action.method,
  }));

/**
 * GET /v1/account/{account}/txns-only
 *
 * Mirrors services/v3/accounts/txns: `from`/`to` map onto the v3
 * `signer`/`receiver` filters (intersect CTE when either is set, union CTE
 * otherwise), including v1's "both set and neither is the account -> empty"
 * short circuit.
 *
 * Non-1:1: `after_date` -> 422 (v3 has no lower bound) and `order=asc` -> 422;
 * `per_page` capped at 100; `before_date` is honoured as the v3 `before` ns
 * bound. The cursor is the v3 opaque token, not `transactions.id`. Per-row `id`
 * and `receipt_conversion_tokens_burnt`, and per-action `deposit`/`fee`/`args`,
 * have no v3 source and are emitted as `null`. `block.block_height`,
 * `actions_agg.deposit` and `outcomes_agg.transaction_fee` are coerced from the
 * v3 strings back to the JSON numbers v1 emitted.
 */
const txnsOnly = proxyAsync(
  async (req: RequestValidator<TxnsOnly>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');
    if (data.order === 'asc') return rejected(res, 'order');

    const account = data.account;
    const signer = data.from;
    const receiver = data.to;

    if (signer && receiver && signer !== account && receiver !== account) {
      return res.status(200).json({ txns: [] });
    }

    const limit = Math.min(data.per_page, 100);
    const before = beforeTs(data.before_date);
    const next = data.cursor
      ? cursors.decode(txnRequest.cursor, data.cursor)
      : null;

    const txnsQuery: WindowListQuery<AccountTxn> = (start, end, l) => {
      const cte = pgp.as.format(
        signer || receiver ? sql.txns.cte : sql.txns.cteUnion,
        {
          before,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
          },
          direction: 'desc',
          end,
          limit: l,
          receiver: receiver || account,
          signer: signer || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountTxn>(sql.txns.txns, {
        cte,
        direction: 'desc',
      });
    };

    const rows = await rollingWindowList<AccountTxn>(txnsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, before, 'desc'),
      limit: limit + 1,
      start: windowStart(config.baseStart, next?.timestamp, 'desc'),
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (txn) => ({
        index: txn.index_in_chunk,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!next,
    );

    const txns = (page.data ?? []).map((txn) => ({
      actions: legacyActions(txn.actions),
      actions_agg: { deposit: toNumber(txn.actions_agg?.deposit) },
      block: { block_height: numberOrNull(txn.block?.block_height) },
      block_timestamp: txn.block_timestamp,
      id: null,
      included_in_block_hash: txn.block?.block_hash ?? null,
      outcomes: { status: txn.outcomes?.status ?? null },
      outcomes_agg: {
        transaction_fee: toNumber(txn.outcomes_agg?.transaction_fee),
      },
      receipt_conversion_tokens_burnt: null,
      receiver_account_id: txn.receiver_account_id,
      signer_account_id: txn.signer_account_id,
      transaction_hash: txn.transaction_hash,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), txns });
  },
);

/**
 * GET /v1/account/{account}/txns-only/count
 *
 * Non-1:1: `after_date` -> 422. The unfiltered count comes from the v3
 * continuous aggregate and every other path is capped at `maxQueryCount`; the
 * proxy strips the cap suffix, so a true count above the cap reports as the cap
 * (v1 returned a planner estimate, or `{cost, count}` rows when the estimate was
 * too expensive — that fallback shape is gone).
 */
const txnsOnlyCount = catchAsync(
  async (req: RequestValidator<TxnsOnlyCount>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');

    const account = data.account;
    const signer = data.from;
    const receiver = data.to;

    if (signer && receiver && signer !== account && receiver !== account) {
      return res.status(200).json({ txns: [] });
    }

    const before = beforeTs(data.before_date);

    if (!signer && !receiver && !before) {
      const result = await dbBase.one<{ count: string }>(sql.txns.countCagg, {
        account,
      });
      const count = await countFromCagg(result.count, config.maxQueryCount, () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbBase.one<{ count: string }>(sql.txns.countUnion, {
              before,
              end,
              limit,
              receiver: account,
              signer: account,
              start,
            }),
          { limit: config.maxQueryCount, start: config.baseStart },
        ),
      );

      return res.status(200).json({ txns: [{ count: legacyCount(count) }] });
    }

    const countSql = signer || receiver ? sql.txns.count : sql.txns.countUnion;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(countSql, {
          before,
          end,
          limit,
          receiver: receiver || account,
          signer: signer || account,
          start,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.baseStart,
      },
    );

    return res.status(200).json({
      txns: [{ count: legacyCount(cappedCount(count, config.maxQueryCount)) }],
    });
  },
);

/**
 * GET /v1/account/{account}/receipts
 *
 * Mirrors services/v3/accounts/receipts; `from`/`to`/`action`/`method` map
 * one-to-one onto the v3 `predecessor`/`receiver`/`action`/`method` filters,
 * including v1's "both set and neither is the account -> empty" short circuit.
 *
 * Non-1:1: `after_date` -> 422, `order=asc` -> 422, `per_page` capped at 100,
 * cursor is the v3 opaque token. v1 rows mixed receipt-level and
 * transaction-level columns; the v3 account-receipt row is receipt-level only,
 * so every transaction-level field is emitted as `null`:
 * `block_timestamp`, `block.block_height`, `included_in_block_hash`,
 * `receipt_conversion_tokens_burnt`, `outcomes.status` (the *transaction*
 * status — the receipt's status is in `receipt_outcome`),
 * `outcomes_agg.transaction_fee` and `actions_agg.deposit` (v1 aggregated the
 * transaction's converted receipt, v3 aggregates this receipt — reporting the
 * v3 value under the v1 name would be a different number). `receipt_outcome`
 * keeps only `status`; `gas_burnt`/`tokens_burnt`/`executor_account_id` and the
 * per-action `deposit`/`fee`/`args` have no v3 source. Per-row `id` is `null`.
 */
const receipts = proxyAsync(
  async (req: RequestValidator<Receipts>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');
    if (data.order === 'asc') return rejected(res, 'order');

    const account = data.account;
    const predecessor = data.from;
    const receiver = data.to;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return res.status(200).json({ txns: [] });
    }

    const limit = Math.min(data.per_page, 100);
    const before = beforeTs(data.before_date);
    const next = data.cursor
      ? cursors.decode(receiptRequest.cursor, data.cursor)
      : null;

    const receiptsQuery: WindowListQuery<AccountReceipt> = (start, end, l) => {
      const cte = pgp.as.format(
        predecessor || receiver ? sql.receipts.cte : sql.receipts.cteUnion,
        {
          action: data.action,
          before,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
          },
          direction: 'desc',
          end,
          limit: l,
          method: data.method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountReceipt>(sql.receipts.receipts, {
        cte,
        direction: 'desc',
      });
    };

    const rows = await rollingWindowList<AccountReceipt>(receiptsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, before, 'desc'),
      limit: limit + 1,
      start: windowStart(config.baseStart, next?.timestamp, 'desc'),
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (receipt) => ({
        index: receipt.index_in_chunk,
        shard: receipt.shard_id,
        timestamp: receipt.included_in_block_timestamp,
      }),
      !!next,
    );

    const txns = (page.data ?? []).map((receipt) => ({
      actions: legacyActions(receipt.actions),
      actions_agg: { deposit: null },
      block: { block_height: null },
      block_timestamp: null,
      id: null,
      included_in_block_hash: null,
      outcomes: { status: null },
      outcomes_agg: { transaction_fee: null },
      predecessor_account_id: receipt.predecessor_account_id,
      receipt_block: {
        block_hash: receipt.block?.block_hash ?? null,
        block_height: numberOrNull(receipt.block?.block_height),
        block_timestamp: numberOrNull(receipt.block?.block_timestamp),
      },
      receipt_conversion_tokens_burnt: null,
      receipt_id: receipt.receipt_id,
      receipt_outcome: {
        executor_account_id: null,
        gas_burnt: null,
        status: receipt.outcome?.status ?? null,
        tokens_burnt: null,
      },
      receiver_account_id: receipt.receiver_account_id,
      transaction_hash: receipt.transaction_hash,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), txns });
  },
);

/**
 * GET /v1/account/{account}/receipts/count
 *
 * Non-1:1: `after_date` -> 422; the count is the v3 continuous aggregate when
 * unfiltered and is otherwise capped at `maxQueryCount`, with the cap suffix
 * stripped (v1 returned a planner estimate).
 */
const receiptsCount = catchAsync(
  async (req: RequestValidator<ReceiptsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');

    const account = data.account;
    const predecessor = data.from;
    const receiver = data.to;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return res.status(200).json({ txns: [] });
    }

    const action = data.action;
    const method = data.method;
    const before = beforeTs(data.before_date);

    if (!predecessor && !receiver && !action && !method && !before) {
      const result = await dbBase.one<{ count: string }>(
        sql.receipts.countCagg,
        { account },
      );
      const count = await countFromCagg(result.count, config.maxQueryCount, () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbBase.one<{ count: string }>(sql.receipts.countUnion, {
              action,
              before,
              end,
              limit,
              method,
              predecessor: account,
              receiver: account,
              start,
            }),
          { limit: config.maxQueryCount, start: config.baseStart },
        ),
      );

      return res.status(200).json({ txns: [{ count: legacyCount(count) }] });
    }

    const countSql =
      predecessor || receiver ? sql.receipts.count : sql.receipts.countUnion;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(countSql, {
          action,
          before,
          end,
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.baseStart,
      },
    );

    return res.status(200).json({
      txns: [{ count: legacyCount(cappedCount(count, config.maxQueryCount)) }],
    });
  },
);

/**
 * GET /v2/account/{account}/receipts
 *
 * The v2 row is already receipt-shaped, so this is the closest v3 fit:
 * `from`/`to`/`action`/`method` map onto `predecessor`/`receiver`/`action`/
 * `method`, and `before_timestamp` is passed through to the v3 `before_ts` ns
 * bound unchanged.
 *
 * Non-1:1: `after_timestamp` -> 422 (v3 exposes no lower bound), `order=asc` ->
 * 422, cursor is the v3 opaque token instead of `receipts.id`. Per-row `id` is
 * `null`; `outcome` keeps only `status`
 * (`gas_burnt`/`tokens_burnt`/`executor_account_id` -> `null`) and per-action
 * `deposit`/`args` -> `null`. `block.block_height` is coerced back to the JSON
 * number v2 emitted; `block.block_timestamp` and `actions_agg.deposit` stay
 * strings as in v2.
 */
const v2Receipts = proxyAsync(
  async (req: RequestValidator<V2Receipts>, res: Response) => {
    const data = req.validator.data;

    if (data.after_timestamp) return rejected(res, 'after_timestamp');
    if (data.order === 'asc') return rejected(res, 'order');

    const account = data.account;
    const predecessor = data.from;
    const receiver = data.to;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return res.status(200).json({ txns: [] });
    }

    const limit = Math.min(data.per_page, 100);
    const before = data.before_timestamp;
    const next = data.cursor
      ? cursors.decode(receiptRequest.cursor, data.cursor)
      : null;

    const receiptsQuery: WindowListQuery<AccountReceipt> = (start, end, l) => {
      const cte = pgp.as.format(
        predecessor || receiver ? sql.receipts.cte : sql.receipts.cteUnion,
        {
          action: data.action,
          before,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
          },
          direction: 'desc',
          end,
          limit: l,
          method: data.method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountReceipt>(sql.receipts.receipts, {
        cte,
        direction: 'desc',
      });
    };

    const rows = await rollingWindowList<AccountReceipt>(receiptsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, before, 'desc'),
      limit: limit + 1,
      start: windowStart(config.baseStart, next?.timestamp, 'desc'),
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (receipt) => ({
        index: receipt.index_in_chunk,
        shard: receipt.shard_id,
        timestamp: receipt.included_in_block_timestamp,
      }),
      !!next,
    );

    const txns = (page.data ?? []).map((receipt) => ({
      actions: legacyV2Actions(receipt.actions),
      actions_agg: { deposit: receipt.actions_agg?.deposit ?? null },
      block: {
        block_hash: receipt.block?.block_hash ?? null,
        block_height: numberOrNull(receipt.block?.block_height),
        block_timestamp: receipt.block?.block_timestamp ?? null,
      },
      id: null,
      outcome: {
        executor_account_id: null,
        gas_burnt: null,
        status: receipt.outcome?.status ?? null,
        tokens_burnt: null,
      },
      predecessor_account_id: receipt.predecessor_account_id,
      receipt_id: receipt.receipt_id,
      receiver_account_id: receipt.receiver_account_id,
      transaction_hash: receipt.transaction_hash,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), txns });
  },
);

/**
 * GET /v2/account/{account}/receipts/count
 *
 * Non-1:1: `after_date` (the v2 zod name for `after_timestamp`) -> 422;
 * `before_date` is passed through as the v3 `before_ts` ns bound. The count is
 * the v3 continuous aggregate when unfiltered, otherwise capped at
 * `maxQueryCount` with the cap suffix stripped.
 */
const v2ReceiptsCount = catchAsync(
  async (req: RequestValidator<V2ReceiptsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');

    const account = data.account;
    const predecessor = data.from;
    const receiver = data.to;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return res.status(200).json({ txns: [] });
    }

    const action = data.action;
    const method = data.method;
    const before = data.before_date;

    if (!predecessor && !receiver && !action && !method && !before) {
      const result = await dbBase.one<{ count: string }>(
        sql.receipts.countCagg,
        { account },
      );
      const count = await countFromCagg(result.count, config.maxQueryCount, () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbBase.one<{ count: string }>(sql.receipts.countUnion, {
              action,
              before,
              end,
              limit,
              method,
              predecessor: account,
              receiver: account,
              start,
            }),
          { limit: config.maxQueryCount, start: config.baseStart },
        ),
      );

      return res.status(200).json({ txns: [{ count: legacyCount(count) }] });
    }

    const countSql =
      predecessor || receiver ? sql.receipts.count : sql.receipts.countUnion;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(countSql, {
          action,
          before,
          end,
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.baseStart,
      },
    );

    return res.status(200).json({
      txns: [{ count: legacyCount(cappedCount(count, config.maxQueryCount)) }],
    });
  },
);

export default {
  receipts,
  receiptsCount,
  schemas,
  txnsOnly,
  txnsOnlyCount,
  v2Receipts,
  v2ReceiptsCount,
};
