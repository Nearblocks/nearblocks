import { unionWith } from 'es-toolkit';
import { Response } from 'express';
import { z } from 'zod';

import type { AccountFTTxn, AccountNFTTxn } from 'nb-schemas';
import ftRequest from 'nb-schemas/dist/accounts/fts/request.js';
import nftRequest from 'nb-schemas/dist/accounts/nfts/request.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import { legacyCursor, proxyAsync, rejected } from '#libs/proxy';
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
  FtTxns,
  FtTxnsCount,
  NftTxns,
  NftTxnsCount,
} from '#libs/schema/account';
import {
  beforeTs,
  legacyCount,
  numberOrNull,
} from '#services/proxy/account-common';
import sql from '#sql/accounts';
import { RequestValidator } from '#types/types';

// v1 `/account/{account}/ft-txns` + `/nft-txns`, served by reusing the shared v3
// account ft/nft query modules (#sql/accounts + #libs/response) and reformatting
// to the legacy v1 JSON shape. The orchestration mirrors
// services/v3/accounts/{fts,nfts}: the event page comes from the events DB, then
// the per-event receipt/txn/block lookup is a UNION ALL on the base DB.

// The proxy emits the v3 opaque cursor; the legacy v1 schemas constrained
// `cursor` to the fixed-length `event_index`.
const schemas = {
  ftTxns: schema.ftTxns.extend({ cursor: z.string().optional() }),
  nftTxns: schema.nftTxns.extend({ cursor: z.string().optional() }),
};

/**
 * GET /v1/account/{account}/ft-txns
 *
 * `involved`, `contract` and `event` map onto the v3 `involved`, `contract` and
 * `cause` filters — v1's `EventKind` and v3's `EventCause` share the same
 * MINT/BURN/TRANSFER values, so `event` is honoured rather than rejected.
 *
 * Non-1:1: `after_date` -> 422, `page`>1 -> 422, `order=asc` -> 422, `per_page`
 * capped at 100; `before_date` becomes the v3 `before` ns bound. The cursor is
 * the v3 opaque token, and `event_index` is v3's per-shard index rather than
 * v1's global `ft_events.event_index` (a number instead of a string). The v3
 * metadata object is renamed `meta` -> `ft`. `outcomes.status` and
 * `outcomes_agg.transaction_fee` have no source in the v3 ft query and are
 * emitted as `null` under their original keys. `block.block_height` is coerced
 * back to a JSON number; `block_timestamp`/`included_in_block_hash` come from
 * the joined transaction's block, exactly as in v1.
 */
const ftTxns = proxyAsync(
  async (req: RequestValidator<FtTxns>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');
    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const account = data.account;
    const contract = data.contract;
    const involved = data.involved;
    const cause = data.event;
    const limit = Math.min(data.per_page, 100);
    const before = beforeTs(data.before_date);
    const next = data.cursor
      ? cursors.decode(ftRequest.cursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<AccountFTTxn> = (start, end, l) =>
      dbEvents.manyOrNone<AccountFTTxn>(sql.fts.txns, {
        account,
        before,
        cause,
        contract,
        cursor: {
          index: next?.index,
          shard: next?.shard,
          timestamp: next?.timestamp,
          type: next?.type,
        },
        direction: 'desc',
        end,
        involved,
        limit: l,
        start,
      });

    const events = await rollingWindowList<AccountFTTxn>(eventsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, before, 'desc'),
      limit: limit + 1,
      start: windowStart(config.eventsStart, next?.timestamp, 'desc'),
    });

    let rows: AccountFTTxn[] = [];

    if (events.length) {
      const unionQuery = events
        .map((event) => pgp.as.format(sql.fts.txn, event))
        .join('\nUNION ALL\n');
      const txns = await dbBase.manyOrNone<AccountFTTxn>(unionQuery);

      // If lengths don't match, receipts are missing (maybe delayed).
      rows =
        txns.length === events.length
          ? txns
          : unionWith(
              txns,
              events,
              (a, b) =>
                `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
                `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
            );
    }

    const page = paginateData(
      rows,
      limit,
      'desc',
      (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
        type: txn.event_type,
      }),
      !!next,
    );

    const txns = (page.data ?? []).map((txn) => ({
      affected_account_id: txn.affected_account_id,
      block: { block_height: numberOrNull(txn.block?.block_height) },
      block_timestamp: txn.block?.block_timestamp ?? null,
      cause: txn.cause,
      delta_amount: txn.delta_amount,
      event_index: txn.event_index,
      ft: txn.meta ?? null,
      included_in_block_hash: txn.block?.block_hash ?? null,
      involved_account_id: txn.involved_account_id,
      outcomes: { status: null },
      outcomes_agg: { transaction_fee: null },
      transaction_hash: txn.transaction_hash ?? null,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), txns });
  },
);

/**
 * GET /v1/account/{account}/ft-txns/count
 *
 * Non-1:1: `after_date` -> 422. The count is served from the v3 continuous
 * aggregate when only `contract` is set, and is otherwise capped at
 * `maxQueryCount` with the cap suffix stripped (v1 returned a planner estimate).
 */
const ftTxnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');

    const account = data.account;
    const contract = data.contract;
    const involved = data.involved;
    const cause = data.event;
    const before = beforeTs(data.before_date);

    if (!involved && !cause && !before) {
      const sqlKey = contract ? sql.fts.countCaggContract : sql.fts.countCagg;
      const result = await dbEvents.one<{ count: string }>(sqlKey, {
        account,
        contract,
      });
      const count = await countFromCagg(result.count, config.maxQueryCount, () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbEvents.one<{ count: string }>(sql.fts.count, {
              account,
              before,
              cause,
              contract,
              end,
              involved,
              limit,
              start,
            }),
          { limit: config.maxQueryCount, start: config.eventsStart },
        ),
      );

      return res.status(200).json({ txns: [{ count: legacyCount(count) }] });
    }

    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.fts.count, {
          account,
          before,
          cause,
          contract,
          end,
          involved,
          limit,
          start,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.eventsStart,
      },
    );

    return res.status(200).json({
      txns: [{ count: legacyCount(cappedCount(count, config.maxQueryCount)) }],
    });
  },
);

/**
 * GET /v1/account/{account}/nft-txns
 *
 * As ft-txns: `involved`/`event` map onto the v3 `involved`/`cause` filters and
 * the metadata object is renamed `meta` -> `nft`. v1 exposes no `contract` or
 * `token` filter here, so neither is passed to the v3 query.
 *
 * Non-1:1: `after_date` -> 422, `page`>1 -> 422, `order=asc` -> 422, `per_page`
 * capped at 100; the cursor is the v3 opaque token and `event_index` is v3's
 * per-shard index. `outcomes.status` and `outcomes_agg.transaction_fee` have no
 * v3 source and are emitted as `null`. v3's extra `token_meta` is dropped since
 * v1 never emitted it.
 */
const nftTxns = proxyAsync(
  async (req: RequestValidator<NftTxns>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');
    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const account = data.account;
    const involved = data.involved;
    const cause = data.event;
    const limit = Math.min(data.per_page, 100);
    const before = beforeTs(data.before_date);
    const next = data.cursor
      ? cursors.decode(nftRequest.cursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<AccountNFTTxn> = (start, end, l) =>
      dbEvents.manyOrNone<AccountNFTTxn>(sql.nfts.txns, {
        account,
        before,
        cause,
        contract: undefined,
        cursor: {
          index: next?.index,
          shard: next?.shard,
          timestamp: next?.timestamp,
        },
        direction: 'desc',
        end,
        involved,
        limit: l,
        start,
        token: undefined,
      });

    const events = await rollingWindowList<AccountNFTTxn>(eventsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, before, 'desc'),
      limit: limit + 1,
      start: windowStart(config.eventsStart, next?.timestamp, 'desc'),
    });

    let rows: AccountNFTTxn[] = [];

    if (events.length) {
      const unionQuery = events
        .map((event) => pgp.as.format(sql.nfts.txn, event))
        .join('\nUNION ALL\n');
      const txns = await dbBase.manyOrNone<AccountNFTTxn>(unionQuery);

      // If lengths don't match, receipts are missing (maybe delayed).
      rows =
        txns.length === events.length
          ? txns
          : unionWith(
              txns,
              events,
              (a, b) =>
                `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
                `${b.block_timestamp}${b.shard_id}${b.event_index}`,
            );
    }

    const page = paginateData(
      rows,
      limit,
      'desc',
      (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!next,
    );

    const txns = (page.data ?? []).map((txn) => ({
      affected_account_id: txn.affected_account_id,
      block: { block_height: numberOrNull(txn.block?.block_height) },
      block_timestamp: txn.block?.block_timestamp ?? null,
      cause: txn.cause,
      delta_amount: txn.delta_amount,
      event_index: txn.event_index,
      included_in_block_hash: txn.block?.block_hash ?? null,
      involved_account_id: txn.involved_account_id,
      nft: txn.meta ?? null,
      outcomes: { status: null },
      outcomes_agg: { transaction_fee: null },
      token_id: txn.token_id,
      transaction_hash: txn.transaction_hash ?? null,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), txns });
  },
);

/**
 * GET /v1/account/{account}/nft-txns/count
 *
 * Non-1:1: `after_date` -> 422. Unfiltered counts come from the v3 continuous
 * aggregate; every other path is capped at `maxQueryCount` with the cap suffix
 * stripped.
 */
const nftTxnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.after_date) return rejected(res, 'after_date');

    const account = data.account;
    const involved = data.involved;
    const cause = data.event;
    const before = beforeTs(data.before_date);

    if (!involved && !cause && !before) {
      const result = await dbEvents.one<{ count: string }>(sql.nfts.countCagg, {
        account,
      });
      const count = await countFromCagg(result.count, config.maxQueryCount, () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbEvents.one<{ count: string }>(sql.nfts.count, {
              account,
              before,
              cause,
              contract: undefined,
              end,
              involved,
              limit,
              start,
              token: undefined,
            }),
          { limit: config.maxQueryCount, start: config.eventsStart },
        ),
      );

      return res.status(200).json({ txns: [{ count: legacyCount(count) }] });
    }

    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.nfts.count, {
          account,
          before,
          cause,
          contract: undefined,
          end,
          involved,
          limit,
          start,
          token: undefined,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.eventsStart,
      },
    );

    return res.status(200).json({
      txns: [{ count: legacyCount(cappedCount(count, config.maxQueryCount)) }],
    });
  },
);

export default { ftTxns, ftTxnsCount, nftTxns, nftTxnsCount, schemas };
