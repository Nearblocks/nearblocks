import { unionWith } from 'es-toolkit';
import { Request, Response } from 'express';
import { z } from 'zod';

import type {
  FTContract,
  FTContractHolders,
  FTContractTxn,
  FTList,
  FTTxn,
} from 'nb-schemas';
import request from 'nb-schemas/dist/fts/request.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  legacyCursor,
  proxyAsync,
  rejected,
  toNumber,
  uncappedNumber,
} from '#libs/proxy';
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
  Count,
  FtTxns,
  FtTxnsCount,
  Holders,
  HoldersCount,
  Item,
  List,
  Txns,
} from '#libs/schema/fts';
import sql from '#sql/fts';
import { RequestValidator } from '#types/types';

// v1 fungible-token endpoints served by reusing the shared v3 ft query modules
// (#sql/fts + #libs/response) directly and reformatting to the legacy v1 JSON
// shape. No v3 service file is imported or modified; the query orchestration
// mirrors services/v3/fts exactly; see the per-handler notes for the non-1:1
// differences.

// The v1 list/holders endpoints paged with `page` only and the txn endpoints
// constrained `cursor` to the 35-digit legacy `ft_events.event_index`. Both
// are replaced by the v3 opaque cursor, so the schemas are re-exported with an
// unconstrained optional `cursor` (routes swap them in when the flag is on).
const schemas = {
  ftTxns: schema.ftTxns.extend({ cursor: z.string().optional() }),
  holders: schema.holders.extend({ cursor: z.string().optional() }),
  list: schema.list.extend({ cursor: z.string().optional() }),
  txns: schema.txns.extend({ cursor: z.string().optional() }),
};

type Cursored<T> = { cursor?: string } & T;

/**
 * v1 `sort` values -> the v3 `ft_list` column the v3 list query can order by.
 * `change` maps to `change_24` in the legacy DB; the v3 list sort enum has no
 * change column, so it is rejected rather than silently sorted by something
 * else.
 */
const listSort: Record<string, null | string> = {
  change: null,
  holders: 'holders',
  market_cap: 'market_cap',
  onchain_market_cap: 'onchain_market_cap',
  price: 'price',
  transfers: 'transfers',
  volume: 'volume_24h',
};

// The 'aurora' contract is a proxy for the ETH bridge on NEAR; v1 renamed it on
// the list endpoint only.
const bridgeContract = (contract: string) =>
  contract === 'aurora' ? 'eth.bridge.near' : contract;

/**
 * v3 ft txn rows carry the event block, an opaque `meta` object and no outcome
 * status. Reshaped to the v1 row: `meta` -> `ft`, the transaction's block
 * fields flattened back out, `outcomes.status` and `event_index` null.
 */
const legacyTxn = (txn: FTContractTxn | FTTxn) => ({
  affected_account_id: txn.affected_account_id,
  block: { block_height: toNumber(txn.block?.block_height) },
  block_timestamp: txn.block?.block_timestamp ?? txn.block_timestamp,
  cause: txn.cause,
  delta_amount: txn.delta_amount,
  event_index: null,
  ft: txn.meta ?? null,
  included_in_block_hash: txn.block?.block_hash ?? null,
  involved_account_id: txn.involved_account_id,
  outcomes: { status: null },
  transaction_hash: txn.transaction_hash ?? null,
});

/**
 * GET /v1/fts (list)
 *
 * Non-1:1: `sort=change` -> 422 (no v3 `change_24h` sort); `page`>1 -> 422 and
 * an opaque `cursor` is accepted/returned instead; `per_page` capped at 100.
 * `search` matches anywhere in the value on v3 (v1 was a prefix match). Rows
 * carry only the v3 `ft_list` columns — the legacy `SELECT *` extras are
 * dropped — and `change_24h` is renamed back to v1's `change_24`. Ties break on
 * `contract` instead of `symbol`.
 */
const list = proxyAsync(
  async (req: RequestValidator<Cursored<List>>, res: Response) => {
    const data = req.validator.data;

    if (data.page > 1) return rejected(res, 'page');

    const sort = listSort[data.sort];

    if (!sort) return rejected(res, 'sort');

    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.cursor, data.cursor)
      : null;

    const rows = await dbEvents.manyOrNone<FTList>(sql.list, {
      cursor: { contract: next?.contract, sort: next?.sort },
      has_cursor: !!next,
      limit: limit + 1,
      order: data.order,
      order_by: data.order === 'desc' ? 'NULLS LAST' : 'NULLS FIRST',
      search: data.search ? `%${data.search}%` : null,
      sort,
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (token) => ({
        contract: token.contract,
        sort: token[sort as keyof FTList],
      }),
      !!next,
    );

    const tokens = (page.data ?? []).map((token) => ({
      change_24: token.change_24h,
      contract: bridgeContract(token.contract),
      decimals: token.decimals,
      holders: token.holders,
      icon: token.icon,
      market_cap: token.market_cap,
      name: token.name,
      onchain_market_cap: token.onchain_market_cap,
      price: token.price,
      reference: token.reference,
      symbol: token.symbol,
      total_supply: token.total_supply,
      transfers: token.transfers,
      volume_24h: token.volume_24h,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), tokens });
  },
);

/**
 * GET /v1/fts/count
 *
 * Faithful; `search` matches anywhere in the value on v3 (v1 was a prefix
 * match), and v3's `ft_list` only holds contracts with fetched metadata.
 */
const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const search = req.validator.data.search;

    const result = await dbEvents.one<{ count: string }>(sql.count, {
      search: search ? `%${search}%` : null,
    });

    return res.status(200).json({ tokens: [{ count: String(result.count) }] });
  },
);

/**
 * GET /v1/fts/txns (list)
 *
 * Non-1:1: `page`>1 -> 422; the cursor is the v3 opaque token, not the
 * 35-digit legacy `event_index`; `per_page` capped at 100. Per-row
 * `event_index` -> `null` (v3 splits it into timestamp/shard/type/index) and
 * `outcomes` -> `{ status: null }` (v3 does not join execution outcomes).
 * The v3 query keeps only the crediting side of a transfer
 * (`cause = 'BURN' OR delta_amount >= 0`), so a transfer yields one row where
 * v1 returned two.
 */
const txns = proxyAsync(
  async (req: RequestValidator<Cursored<Txns>>, res: Response) => {
    const data = req.validator.data;

    if (data.page > 1) return rejected(res, 'page');

    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.txnsCursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<FTTxn, 'block' | 'transaction_hash'>
    > = (start, end, l) =>
      dbEvents.manyOrNone<Omit<FTTxn, 'block' | 'transaction_hash'>>(sql.txns, {
        before: null,
        cursor: {
          index: next?.index,
          shard: next?.shard,
          timestamp: next?.timestamp,
          type: next?.type,
        },
        direction: 'desc',
        end,
        limit: l,
        start,
      });

    const events = await rollingWindowList(eventsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, undefined, 'desc'),
      limit: limit + 1,
      start: windowStart(config.eventsStart, next?.timestamp, 'desc'),
    });

    if (!events.length) {
      return res.status(200).json({ cursor: undefined, txns: [] });
    }

    const unionQuery = events
      .map((event) => pgp.as.format(sql.txn, event))
      .join('\nUNION ALL\n');
    const rows = await dbBase.manyOrNone<FTTxn>(unionQuery);
    // If lengths don't match, receipts are missing (maybe delayed).
    const merged =
      rows.length === events.length
        ? rows
        : unionWith(
            rows,
            events,
            (a, b) =>
              `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
              `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
          );

    const page = paginateData(
      merged,
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

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      txns: (page.data ?? []).map(legacyTxn),
    });
  },
);

/**
 * GET /v1/fts/txns/count
 *
 * Non-1:1: v1 returned a planner row estimate over the whole `ft_events` table.
 * v3 reads its continuous aggregate and caps the exact fallback at
 * `maxQueryCount`; the proxy strips the cap suffix, so a true count above the
 * cap reports as the cap. The v3 count also excludes the debit side of a
 * transfer.
 */
const txnsCount = catchAsync(async (_req: Request, res: Response) => {
  const cagg = await dbEvents.one<{ count: string }>(sql.txnCountCagg);
  const value = await countFromCagg(cagg.count, config.maxQueryCount, () =>
    rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.txnCount, {
          before: null,
          end,
          limit,
          start,
        }),
      { limit: config.maxQueryCount, start: config.eventsStart },
    ),
  );

  return res
    .status(200)
    .json({ txns: [{ count: String(uncappedNumber(value)) }] });
});

/**
 * GET /v1/fts/{contract}
 *
 * Non-1:1: `livecoinwatch_id` has no v3 source -> `null`. v3's names are mapped
 * back to v1's (`change_24h` -> `change_24`, `hex_address` ->
 * `nep518_hex_address`) and its extra columns (`circulating_supply`, `spec`,
 * `reference_hash`) are trimmed. v3 only returns contracts whose metadata has
 * been fetched (`modified_at IS NOT NULL`), so an unindexed contract yields an
 * empty array where v1 returned a bare row.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const data = await dbEvents.oneOrNone<FTContract>(sql.contract, {
    contract: req.validator.data.contract,
  });

  const contracts = data
    ? [
        {
          change_24: data.change_24h,
          coingecko_id: data.coingecko_id,
          coinmarketcap_id: data.coinmarketcap_id,
          contract: data.contract,
          decimals: data.decimals,
          description: data.description,
          facebook: data.facebook,
          fully_diluted_market_cap: data.fully_diluted_market_cap,
          icon: data.icon,
          livecoinwatch_id: null,
          market_cap: data.market_cap,
          name: data.name,
          nep518_hex_address: data.hex_address,
          onchain_market_cap: data.onchain_market_cap,
          price: data.price,
          reddit: data.reddit,
          reference: data.reference,
          symbol: data.symbol,
          telegram: data.telegram,
          total_supply: data.total_supply,
          twitter: data.twitter,
          volume_24h: data.volume_24h,
          website: data.website,
        },
      ]
    : [];

  return res.status(200).json({ contracts });
});

/**
 * GET /v1/fts/{contract}/txns
 *
 * Non-1:1: `event` -> 422 (the v3 query has no `cause` filter) and `order=asc`
 * -> 422; `page`>1 -> 422 with the v3 opaque cursor replacing the 35-digit
 * `event_index` one; `per_page` capped at 100. `a`/`account` are honoured (v3
 * `affected`). Per-row `event_index` -> `null`, `outcomes` ->
 * `{ status: null }`. Without an account filter the v3 query keeps only the
 * crediting side of a transfer.
 */
const contractTxns = proxyAsync(
  async (req: RequestValidator<Cursored<FtTxns>>, res: Response) => {
    const data = req.validator.data;

    if (data.event) return rejected(res, 'event');
    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const contract = data.contract;
    const affected = data.a || data.account || null;
    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.txnsCursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<FTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, l) =>
      dbEvents.manyOrNone<Omit<FTContractTxn, 'block' | 'transaction_hash'>>(
        sql.contractTxns,
        {
          affected,
          before: null,
          contract,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
            type: next?.type,
          },
          direction: 'desc',
          end,
          limit: l,
          start,
        },
      );

    const events = await rollingWindowList(eventsQuery, {
      direction: 'desc',
      end: windowEnd(next?.timestamp, undefined, 'desc'),
      limit: limit + 1,
      start: windowStart(config.eventsStart, next?.timestamp, 'desc'),
    });

    if (!events.length) {
      return res.status(200).json({ cursor: undefined, txns: [] });
    }

    const unionQuery = events
      .map((event) => pgp.as.format(sql.contractTxn, event))
      .join('\nUNION ALL\n');
    const rows = await dbBase.manyOrNone<FTContractTxn>(unionQuery);
    // If lengths don't match, receipts are missing (maybe delayed).
    const merged =
      rows.length === events.length
        ? rows
        : unionWith(
            rows,
            events,
            (a, b) =>
              `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
              `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
          );

    const page = paginateData(
      merged,
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

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      txns: (page.data ?? []).map(legacyTxn),
    });
  },
);

/**
 * GET /v1/fts/{contract}/txns/count
 *
 * Non-1:1: `event` -> 422. v1 returned an exact count (or a planner estimate
 * for expensive queries); v3 caps at `maxQueryCount` and the proxy strips the
 * cap, so a true count above the cap reports as the cap.
 */
const contractTxnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.event) return rejected(res, 'event');

    const contract = data.contract;
    const affected = data.a || data.account || null;

    const exactCount = () =>
      rollingWindowCount(
        (start, end, limit) =>
          dbEvents.one<{ count: string }>(sql.contractTxnCount, {
            affected,
            before: null,
            contract,
            end,
            limit,
            start,
          }),
        { limit: config.maxQueryCount, start: config.eventsStart },
      );

    let value: string;

    if (!affected) {
      const cagg = await dbEvents.one<{ count: string }>(
        sql.contractTxnCountCagg,
        { contract },
      );

      value = await countFromCagg(cagg.count, config.maxQueryCount, exactCount);
    } else {
      value = cappedCount(await exactCount(), config.maxQueryCount);
    }

    return res
      .status(200)
      .json({ txns: [{ count: String(uncappedNumber(value)) }] });
  },
);

/**
 * GET /v1/fts/{contract}/holders
 *
 * Non-1:1: `page`>1 -> 422 and `order=asc` -> 422 (v3 sorts by amount
 * descending only); `per_page` capped at 100. An opaque `cursor` is accepted
 * and returned so the list stays pageable. v3 reads `ft_holders` where v1 read
 * `ft_holders_new`.
 */
const holders = proxyAsync(
  async (req: RequestValidator<Cursored<Holders>>, res: Response) => {
    const data = req.validator.data;

    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.contractHoldersCursor, data.cursor)
      : null;

    const rows = await dbEvents.manyOrNone<FTContractHolders>(sql.holders, {
      accountDirection: 'asc',
      contract: data.contract,
      cursor: { account: next?.account, amount: next?.amount },
      direction: 'desc',
      limit: limit + 1,
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (holder) => ({ account: holder.account, amount: holder.amount }),
      !!next,
    );

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      holders: (page.data ?? []).map((holder) => ({
        account: holder.account,
        amount: holder.amount,
      })),
    });
  },
);

/**
 * GET /v1/fts/{contract}/holders/count
 *
 * Faithful (exact `COUNT(*)` in both); v3 reads `ft_holders` where v1 read
 * `ft_holders_new`.
 */
const holdersCount = catchAsync(
  async (req: RequestValidator<HoldersCount>, res: Response) => {
    const result = await dbEvents.one<{ count: string }>(sql.holderCount, {
      contract: req.validator.data.contract,
    });

    return res.status(200).json({ holders: [{ count: String(result.count) }] });
  },
);

export default {
  contract: {
    holders,
    holdersCount,
    item,
    txns: contractTxns,
    txnsCount: contractTxnsCount,
  },
  ft: { count, list, txns, txnsCount },
  schemas,
};
