import { unionWith } from 'es-toolkit';
import { Request, Response } from 'express';
import { z } from 'zod';

import type {
  NFTContract,
  NFTContractHolders,
  NFTContractTxn,
  NFTList,
  NFTTxn,
} from 'nb-schemas';
import request from 'nb-schemas/dist/nfts/request.js';
import type {
  NFTToken,
  NFTTokenList,
  NFTTokenTxn,
} from 'nb-schemas/dist/nfts/tokens/index.js';
import tokenRequest from 'nb-schemas/dist/nfts/tokens/request.js';

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
  Holders,
  HoldersCount,
  Item,
  List,
  NftTxns,
  NftTxnsCount,
  TokenItem,
  Tokens,
  TokensCount,
  TokenTxns,
  TokenTxnsCount,
  Txns,
} from '#libs/schema/nfts';
import sql from '#sql/nfts';
import { RequestValidator } from '#types/types';

// v1 non-fungible-token endpoints served by reusing the shared v3 nft query
// modules (#sql/nfts + #libs/response) directly and reformatting to the legacy
// v1 JSON shape. No v3 service file is imported or modified; the query
// orchestration mirrors services/v3/nfts exactly; see the per-handler notes for
// the non-1:1 differences.

// The v1 list/holders/tokens endpoints paged with `page` only and the txn
// endpoints constrained `cursor` to the 35-digit legacy
// `nft_events.event_index`. Both are replaced by the v3 opaque cursor, so the
// schemas are re-exported with an unconstrained optional `cursor` (routes swap
// them in when the flag is on).
const schemas = {
  holders: schema.holders.extend({ cursor: z.string().optional() }),
  list: schema.list.extend({ cursor: z.string().optional() }),
  nftTxns: schema.nftTxns.extend({ cursor: z.string().optional() }),
  tokens: schema.tokens.extend({ cursor: z.string().optional() }),
  tokenTxns: schema.tokenTxns.extend({ cursor: z.string().optional() }),
  txns: schema.txns.extend({ cursor: z.string().optional() }),
};

type Cursored<T> = { cursor?: string } & T;

/**
 * v1 `sort` values -> the v3 `nft_list` column the v3 list query can order by.
 * The v3 list sort enum has no `holders` column, so that sort is rejected
 * rather than silently answered in another order.
 */
const listSort: Record<string, null | string> = {
  holders: null,
  tokens: 'tokens',
  txns_day: 'transfers_24h',
};

/**
 * v3 nft txn rows carry the event block, an opaque `meta` object and no outcome
 * status. Reshaped to the v1 row: the transaction's block fields flattened back
 * out, `delta_amount` coerced from v3's text back to a JSON number,
 * `outcomes.status` and `event_index` null.
 */
const legacyTxn = (txn: NFTContractTxn | NFTTokenTxn | NFTTxn) => ({
  affected_account_id: txn.affected_account_id,
  block: { block_height: toNumber(txn.block?.block_height) },
  block_timestamp: txn.block?.block_timestamp ?? txn.block_timestamp,
  cause: txn.cause,
  delta_amount: toNumber(txn.delta_amount),
  event_index: null,
  included_in_block_hash: txn.block?.block_hash ?? null,
  involved_account_id: txn.involved_account_id,
  outcomes: { status: null },
  token_id: txn.token_id,
  transaction_hash: txn.transaction_hash ?? null,
});

/** v1 embedded the collection metadata under `nft`; v3 calls it `meta`. */
const legacyCollectionTxn = (txn: NFTContractTxn | NFTTxn) => ({
  ...legacyTxn(txn),
  nft: txn.meta ?? null,
});

/**
 * GET /v1/nfts (list)
 *
 * Non-1:1: `sort=holders` -> 422 (the v3 list has no holders column); `page`>1
 * -> 422 and an opaque `cursor` is accepted/returned instead; `per_page` capped
 * at 100. `search` matches anywhere in the value on v3 (v1 was a prefix match).
 * Rows carry only the v3 `nft_list` columns — the legacy `SELECT *` extras
 * are dropped — `holders` has no v3 source and is `null`, and v3's
 * `transfers_24h` is emitted under v1's name `transfers_day`. Ties break on
 * `contract` instead of `holders`/`symbol`.
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

    const rows = await dbEvents.manyOrNone<NFTList>(sql.list, {
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
        sort: token[sort as keyof NFTList],
      }),
      !!next,
    );

    const tokens = (page.data ?? []).map((token) => ({
      base_uri: token.base_uri,
      contract: token.contract,
      holders: null,
      icon: token.icon,
      name: token.name,
      reference: token.reference,
      symbol: token.symbol,
      tokens: token.tokens,
      transfers_day: token.transfers_24h,
    }));

    return res
      .status(200)
      .json({ cursor: legacyCursor(page.meta?.next_page), tokens });
  },
);

/**
 * GET /v1/nfts/count
 *
 * Faithful; `search` matches anywhere in the value on v3 (v1 was a prefix
 * match), and v3's `nft_list` only holds contracts with fetched metadata.
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
 * GET /v1/nfts/txns (list)
 *
 * Non-1:1: `page`>1 -> 422; the cursor is the v3 opaque token, not the
 * 35-digit legacy `event_index`; `per_page` capped at 100. Per-row
 * `event_index` -> `null` and `outcomes` -> `{ status: null }` (v3 does not
 * join execution outcomes). The v3 query keeps only the crediting side of a
 * transfer (`cause = 'BURN' OR delta_amount >= 0`), so a transfer yields one
 * row where v1 returned two.
 */
const txns = proxyAsync(
  async (req: RequestValidator<Cursored<Txns>>, res: Response) => {
    const data = req.validator.data;

    if (data.page > 1) return rejected(res, 'page');

    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.txnCursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<NFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, l) =>
      dbEvents.manyOrNone<Omit<NFTTxn, 'block' | 'transaction_hash'>>(
        sql.txns,
        {
          before: null,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
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
      .map((event) => pgp.as.format(sql.txn, event))
      .join('\nUNION ALL\n');
    const rows = await dbBase.manyOrNone<NFTTxn>(unionQuery);
    // If lengths don't match, receipts are missing (maybe delayed).
    const merged =
      rows.length === events.length
        ? rows
        : unionWith(
            rows,
            events,
            (a, b) =>
              `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
              `${b.block_timestamp}${b.shard_id}${b.event_index}`,
          );

    const page = paginateData(
      merged,
      limit,
      'desc',
      (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!next,
    );

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      txns: (page.data ?? []).map(legacyCollectionTxn),
    });
  },
);

/**
 * GET /v1/nfts/txns/count
 *
 * Non-1:1: v1 returned a planner row estimate over the whole `nft_events`
 * table. v3 reads its continuous aggregate and caps the exact fallback at
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
 * GET /v1/nfts/{contract}
 *
 * Non-1:1: the socials `twitter`/`facebook`/`telegram`/`reddit`/`website` are
 * not selected by the v3 contract query and are emitted as `null`. `tokens`
 * comes from the `nft_list` aggregate instead of a live `COUNT` over
 * `nft_token_meta`. v3 only returns contracts whose metadata has been fetched
 * (`modified_at IS NOT NULL`), so an unindexed contract yields an empty array
 * where v1 returned a bare row.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const data = await dbEvents.oneOrNone<NFTContract>(sql.contract, {
    contract: req.validator.data.contract,
  });

  const contracts = data
    ? [
        {
          base_uri: data.base_uri,
          contract: data.contract,
          description: data.description,
          facebook: null,
          icon: data.icon,
          name: data.name,
          reddit: null,
          reference: data.reference,
          symbol: data.symbol,
          telegram: null,
          tokens: data.tokens,
          twitter: null,
          website: null,
        },
      ]
    : [];

  return res.status(200).json({ contracts });
});

/**
 * GET /v1/nfts/{contract}/txns
 *
 * Non-1:1: `event` -> 422 (the v3 query has no `cause` filter) and `order=asc`
 * -> 422; `page`>1 -> 422 with the v3 opaque cursor replacing the 35-digit
 * `event_index` one; `per_page` capped at 100. `a`/`account` are honoured (v3
 * `affected`). Per-row `event_index` -> `null`, `outcomes` ->
 * `{ status: null }`. Without an account filter the v3 query keeps only the
 * crediting side of a transfer.
 */
const contractTxns = proxyAsync(
  async (req: RequestValidator<Cursored<NftTxns>>, res: Response) => {
    const data = req.validator.data;

    if (data.event) return rejected(res, 'event');
    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const contract = data.contract;
    const affected = data.a || data.account || null;
    const limit = Math.min(data.per_page, 100);
    const next = data.cursor
      ? cursors.decode(request.txnCursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<NFTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, l) =>
      dbEvents.manyOrNone<Omit<NFTContractTxn, 'block' | 'transaction_hash'>>(
        sql.contractTxns,
        {
          affected,
          before: null,
          contract,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
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
    const rows = await dbBase.manyOrNone<NFTContractTxn>(unionQuery);
    // If lengths don't match, receipts are missing (maybe delayed).
    const merged =
      rows.length === events.length
        ? rows
        : unionWith(
            rows,
            events,
            (a, b) =>
              `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
              `${b.block_timestamp}${b.shard_id}${b.event_index}`,
          );

    const page = paginateData(
      merged,
      limit,
      'desc',
      (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!next,
    );

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      txns: (page.data ?? []).map(legacyCollectionTxn),
    });
  },
);

/**
 * GET /v1/nfts/{contract}/txns/count
 *
 * Non-1:1: `event` -> 422. v1 returned an exact count (or a planner estimate
 * for expensive queries); v3 caps at `maxQueryCount` and the proxy strips the
 * cap, so a true count above the cap reports as the cap.
 */
const contractTxnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
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
 * GET /v1/nfts/{contract}/holders
 *
 * Non-1:1: `page`>1 -> 422 and `order=asc` -> 422 (v3 sorts by quantity
 * descending only); `per_page` capped at 100. An opaque `cursor` is accepted
 * and returned so the list stays pageable. v3 reads `nft_holders` where v1 read
 * `nft_holders_new`.
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

    const rows = await dbEvents.manyOrNone<NFTContractHolders>(sql.holders, {
      accountDirection: 'asc',
      contract: data.contract,
      cursor: { account: next?.account, quantity: next?.quantity },
      direction: 'desc',
      limit: limit + 1,
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (holder) => ({ account: holder.account, quantity: holder.quantity }),
      !!next,
    );

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      holders: (page.data ?? []).map((holder) => ({
        account: holder.account,
        quantity: holder.quantity,
      })),
    });
  },
);

/**
 * GET /v1/nfts/{contract}/holders/count
 *
 * Non-1:1: **different definition**. v1 counted `COUNT(DISTINCT account)`; the
 * v3 query counts holder rows in `nft_holders` (one per account/token), so an
 * account holding several tokens of a collection is counted once per token.
 * The value is therefore >= v1's for multi-token holders.
 */
const holdersCount = catchAsync(
  async (req: RequestValidator<HoldersCount>, res: Response) => {
    const result = await dbEvents.one<{ count: string }>(sql.holderCount, {
      contract: req.validator.data.contract,
    });

    return res.status(200).json({ holders: [{ count: String(result.count) }] });
  },
);

/**
 * GET /v1/nfts/{contract}/tokens
 *
 * Non-1:1: `description`, `copies` and `extra` are not selected by the v3 token
 * list query and are emitted as `null` (use the single-token endpoint for
 * them). `page`>1 -> 422 and an opaque `cursor` is accepted/returned instead;
 * `per_page` is capped at **24** (the v3 token list maximum). Rows are ordered
 * by `token` ascending, where v1 had no ORDER BY at all. Only tokens with
 * fetched metadata and a live holder are returned.
 */
const tokens = proxyAsync(
  async (req: RequestValidator<Cursored<Tokens>>, res: Response) => {
    const data = req.validator.data;

    if (data.page > 1) return rejected(res, 'page');

    const limit = Math.min(data.per_page, 24);
    const next = data.cursor
      ? cursors.decode(tokenRequest.cursor, data.cursor)
      : null;

    const rows = await dbEvents.manyOrNone<NFTTokenList>(sql.tokens.tokens, {
      contract: data.contract,
      cursor: { token: next?.token },
      limit: limit + 1,
    });

    const page = paginateData(
      rows,
      limit,
      'desc',
      (token) => ({ contract: token.contract, token: token.token }),
      !!next,
    );

    return res.status(200).json({
      cursor: legacyCursor(page.meta?.next_page),
      tokens: (page.data ?? []).map((token) => ({
        asset: { owner: token.owner },
        contract: token.contract,
        copies: null,
        description: null,
        extra: null,
        media: token.media,
        reference: token.reference,
        title: token.title,
        token: token.token,
      })),
    });
  },
);

/**
 * GET /v1/nfts/{contract}/tokens/count
 *
 * Faithful (exact `COUNT(*)` in both); v3 counts only tokens whose metadata has
 * been fetched (`modified_at IS NOT NULL`).
 */
const tokensCount = catchAsync(
  async (req: RequestValidator<TokensCount>, res: Response) => {
    const result = await dbEvents.one<{ count: string }>(
      sql.tokens.tokenCount,
      { contract: req.validator.data.contract },
    );

    return res.status(200).json({ tokens: [{ count: String(result.count) }] });
  },
);

/**
 * GET /v1/nfts/{contract}/tokens/{token}
 *
 * Non-1:1: `reference_hash` is not selected by the v3 token query -> `null`.
 * The embedded `nft` collection object IS rebuilt, with one extra call to the
 * v3 nft-contract query (same DB), so it keeps its v1 fields. v3 requires a
 * live holder (`quantity > 0`) for the token, so a fully burned token returns
 * an empty array where v1 returned the row with `asset.owner: null`.
 */
const tokenItem = catchAsync(
  async (req: RequestValidator<TokenItem>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;

    const [data, meta] = await Promise.all([
      dbEvents.oneOrNone<NFTToken>(sql.tokens.token, { contract, token }),
      dbEvents.oneOrNone<NFTContract>(sql.contract, { contract }),
    ]);

    const tokens = data
      ? [
          {
            asset: { owner: data.owner },
            contract: data.contract,
            copies: data.copies,
            description: data.description,
            extra: data.extra,
            media: data.media,
            nft: meta
              ? {
                  base_uri: meta.base_uri,
                  contract: meta.contract,
                  icon: meta.icon,
                  name: meta.name,
                  reference: meta.reference,
                  symbol: meta.symbol,
                }
              : null,
            reference: data.reference,
            reference_hash: null,
            title: data.title,
            token: data.token,
          },
        ]
      : [];

    return res.status(200).json({ tokens });
  },
);

/**
 * GET /v1/nfts/{contract}/tokens/{token}/txns
 *
 * Non-1:1: `event` -> 422 (the v3 query has no `cause` filter) and `order=asc`
 * -> 422; `page`>1 -> 422 with the v3 opaque cursor replacing the 35-digit
 * `event_index` one; `per_page` capped at 100. Per-row `event_index` -> `null`,
 * `outcomes` -> `{ status: null }`. The v3 query keeps only the crediting side
 * of a transfer, so a transfer yields one row where v1 returned two.
 */
const tokenTxns = proxyAsync(
  async (req: RequestValidator<Cursored<TokenTxns>>, res: Response) => {
    const data = req.validator.data;

    if (data.event) return rejected(res, 'event');
    if (data.page > 1) return rejected(res, 'page');
    if (data.order === 'asc') return rejected(res, 'order');

    const contract = data.contract;
    const token = data.token;
    const limit = Math.min(data.per_page, 100);
    // The v3 token-txn cursor is encoded with numeric index/shard, so it is
    // decoded with the numeric nft txn cursor schema.
    const next = data.cursor
      ? cursors.decode(request.txnCursor, data.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<NFTTokenTxn, 'block' | 'transaction_hash'>
    > = (start, end, l) =>
      dbEvents.manyOrNone<Omit<NFTTokenTxn, 'block' | 'transaction_hash'>>(
        sql.tokens.tokenTxns,
        {
          before: null,
          contract,
          cursor: {
            index: next?.index,
            shard: next?.shard,
            timestamp: next?.timestamp,
          },
          direction: 'desc',
          end,
          limit: l,
          start,
          token,
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
      .map((event) => pgp.as.format(sql.tokens.tokenTxn, event))
      .join('\nUNION ALL\n');
    const rows = await dbBase.manyOrNone<NFTTokenTxn>(unionQuery);
    // If lengths don't match, receipts are missing (maybe delayed).
    const merged =
      rows.length === events.length
        ? rows
        : unionWith(
            rows,
            events,
            (a, b) =>
              `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
              `${b.block_timestamp}${b.shard_id}${b.event_index}`,
          );

    const page = paginateData(
      merged,
      limit,
      'desc',
      (txn) => ({
        contract: txn.contract_account_id,
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
        token: txn.token_id,
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
 * GET /v1/nfts/{contract}/tokens/{token}/txns/count
 *
 * Non-1:1: `event` -> 422. v1 returned an exact `COUNT(*)`; the v3 count is
 * capped at `maxQueryCount` and the proxy strips the cap, so a true count above
 * the cap reports as the cap. The v3 count also excludes the debit side of a
 * transfer.
 */
const tokenTxnsCount = catchAsync(
  async (req: RequestValidator<TokenTxnsCount>, res: Response) => {
    const data = req.validator.data;

    if (data.event) return rejected(res, 'event');

    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.tokens.tokenTxnCount, {
          before: null,
          contract: data.contract,
          end,
          limit,
          start,
          token: data.token,
        }),
      { limit: config.maxQueryCount, start: config.eventsStart },
    );

    return res.status(200).json({
      txns: [
        {
          count: String(
            uncappedNumber(cappedCount(count, config.maxQueryCount)),
          ),
        },
      ],
    });
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
  nft: { count, list, txns, txnsCount },
  schemas,
  tokens: {
    count: tokensCount,
    item: tokenItem,
    list: tokens,
    txns: tokenTxns,
    txnsCount: tokenTxnsCount,
  },
};
