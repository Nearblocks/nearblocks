import { Response } from 'express';
import { z } from 'zod';

import type { Txn, TxnFT, TxnNFT, TxnReceipt } from 'nb-schemas';
import request from 'nb-schemas/dist/txns/request.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  legacyCursor,
  proxyAsync,
  rejected,
  toNumber,
  toStringOrNull,
} from '#libs/proxy';
import redis from '#libs/redis';
import {
  cappedCount,
  countFromCagg,
  paginateData,
  rollingWindow,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import schema, { Count, Full, Item, Latest, List } from '#libs/schema/txns';
import { msToNsTime } from '#libs/utils';
import sql from '#sql/txns';
import { RequestValidator } from '#types/types';

// v1 transaction endpoints served by reusing the shared v3 txn query modules
// (#sql/txns + #libs/response) directly and reformatting to the legacy v1 JSON
// shape. No v3 service file is imported or modified. The query orchestration
// mirrors services/v3/txns; see the per-handler notes for the non-1:1
// differences.
//
// `/{hash}` and `/{hash}/full` rebuild v1's flat `receipts[]` from v3's receipt
// *tree* plus the per-receipt ft/nft event queries; the shared loader
// (`loadTxnBundle`) and the receipt helpers are exported for the v2 proxy in
// v2-txns.ts, which assembles the same data into the v2 wire shape.

// The proxy emits the v3 opaque cursor as the v1 `cursor` field; the legacy
// schemas constrained it to the old numeric transactions.id.
const schemas = {
  list: schema.list.extend({ cursor: z.string().optional() }),
};

/**
 * The v3 txn queries express only `block` and an upper timestamp bound. The v1
 * `from`/`to`/`action`/`method` filters have no v3 expression, and `after_date`
 * is a lower bound v3 does not support — a request carrying them is rejected
 * rather than silently answered with an unfiltered result.
 */
const unsupportedFilter = (data: {
  action?: string;
  after_date?: string;
  from?: string;
  method?: string;
  to?: string;
}): null | string => {
  if (data.from) return 'from';
  if (data.to) return 'to';
  if (data.action) return 'action';
  if (data.method) return 'method';
  if (data.after_date) return 'after_date';

  return null;
};

/** v1 `before_date` (YYYY-MM-DD, exclusive) -> the v3 `before` ns bound. */
const beforeTs = (beforeDate?: string): string | undefined => {
  if (!beforeDate) return undefined;

  return String(
    msToNsTime(dayjs(beforeDate, 'YYYY-MM-DD', true).startOf('day').valueOf()),
  );
};

/**
 * v1's txn-detail `actions[].args` was `args ->> 'args_json'` — the *text*
 * serialization of the nested `args_json` object, not the whole args object.
 * Verified against production: `/v1/txns/{hash}` returns
 * `"{\"memo\": ..., \"amount\": ...}"` while `/v3/txns/{hash}` returns
 * `{gas, deposit, args_json, args_base64, method_name}`.
 *
 * So the proxy re-serializes `args_json` to keep `JSON.parse(action.args)`
 * working for existing clients. The round trip through the driver's JSON parse
 * means an integer literal above 2^53 *inside* args_json loses precision where
 * v1 (which serialized server-side) did not — NEAR contracts encode amounts as
 * strings, so this is rare, and a wrong type would break every client whereas
 * this breaks none.
 */
const legacyArgs = (args: unknown): null | string => {
  if (args === null || args === undefined) return null;

  const json = (args as { args_json?: unknown }).args_json;

  return json === null || json === undefined ? null : JSON.stringify(json);
};

/** v3 exposes actions without `args` on list rows; v1 emitted the raw args. */
const legacyActions = (txn: Txn) =>
  (txn.actions ?? []).map((action) => ({
    action: action.action,
    args: null,
    method: action.method,
  }));

/**
 * GET /v1/txns (list)
 *
 * Non-1:1: `from`/`to`/`action`/`method`/`after_date` -> 422 (no v3 expression);
 * `page`>1 and `order=asc` -> 422; `per_page` capped at 100. The cursor is the
 * v3 opaque token, not `transactions.id`. Per-row `id` and per-action `args`
 * have no v3 source and are emitted as `null`.
 */
const list = proxyAsync(async (req: RequestValidator<List>, res: Response) => {
  const data = req.validator.data;
  const unsupported = unsupportedFilter(data);

  if (unsupported) return rejected(res, unsupported);
  if (data.page > 1) return rejected(res, 'page');
  if (data.order === 'asc') return rejected(res, 'order');

  const limit = Math.min(data.per_page, 100);
  const before = beforeTs(data.before_date);
  const block = data.block ?? null;
  const next = data.cursor
    ? cursors.decode(request.cursor, data.cursor)
    : null;

  const txnsQuery: WindowListQuery<Txn> = (start, end, l) => {
    const cte = pgp.as.format(sql.txnsCte, {
      before,
      block,
      cursor: {
        index: next?.index,
        shard: next?.shard,
        timestamp: next?.timestamp,
      },
      direction: 'desc',
      end,
      limit: l,
      start,
    });

    return dbBase.manyOrNone<Txn>(sql.txns, { cte, direction: 'desc' });
  };

  const rows = await rollingWindowList<Txn>(txnsQuery, {
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
    actions: legacyActions(txn),
    actions_agg: { deposit: toNumber(txn.actions_agg?.deposit) },
    block: { block_height: toNumber(txn.block?.block_height) },
    block_timestamp: txn.block_timestamp,
    id: null,
    included_in_block_hash: txn.block?.block_hash ?? null,
    outcomes: { status: txn.outcomes?.status ?? null },
    outcomes_agg: {
      transaction_fee: toNumber(txn.outcomes_agg?.transaction_fee),
    },
    receiver_account_id: txn.receiver_account_id,
    signer_account_id: txn.signer_account_id,
    transaction_hash: txn.transaction_hash,
  }));

  return res
    .status(200)
    .json({ cursor: legacyCursor(page.meta?.next_page), txns });
});

/**
 * GET /v1/txns/count
 *
 * Non-1:1: filtered counts (`from`/`to`/`action`/`method`/`after_date`) -> 422.
 * The unfiltered count comes from the v3 continuous aggregate and is capped at
 * `maxQueryCount`; the proxy strips the cap suffix, so a true count above the
 * cap is reported as the cap (v1 returned an exact estimate).
 */
const count = catchAsync(async (req: RequestValidator<Count>, res: Response) => {
  const data = req.validator.data;
  const unsupported = unsupportedFilter(data);

  if (unsupported) return rejected(res, unsupported);

  const before = beforeTs(data.before_date);
  const block = data.block ?? null;

  const exactCount = () =>
    rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(sql.count, {
          before,
          block,
          end,
          limit,
          start,
        }),
      {
        end: before ? BigInt(before) - 1n : undefined,
        limit: config.maxQueryCount,
        start: config.baseStart,
      },
    );

  let value: string;

  if (!block && !before) {
    const result = await dbBase.one<{ count: string }>(sql.countCagg);

    value = await countFromCagg(result.count, config.maxQueryCount, exactCount);
  } else {
    value = cappedCount(await exactCount(), config.maxQueryCount);
  }

  return res
    .status(200)
    .json({ txns: [{ count: String(Number(value.replace('+', ''))) }] });
});

/**
 * GET /v1/txns/latest
 *
 * v1 exposes a subset of the v3 latest row (hash, timestamp, signer, receiver,
 * and the aggregated deposit).
 */
const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const rollingQuery = rollingWindowList<Txn>(
      (start, end) => {
        const cte = pgp.as.format(sql.latestCte, { end, limit, start });

        return dbBase.manyOrNone<Txn>(sql.txns, { cte, direction: 'desc' });
      },
      { limit, start: config.baseStart },
    );

    const rows = await redis.cache<Txn[]>(
      `v3:txns:latest:${limit}`,
      () => rollingQuery,
      5,
    );

    const txns = (rows ?? []).map((txn) => ({
      actions_agg: { deposit: toNumber(txn.actions_agg?.deposit) },
      block_timestamp: txn.block_timestamp,
      receiver_account_id: txn.receiver_account_id,
      signer_account_id: txn.signer_account_id,
      transaction_hash: txn.transaction_hash,
    }));

    return res.status(200).json({ txns });
  },
);

type EventReceipt = Pick<TxnFT, 'block_timestamp' | 'receipt_id'>;

export type TxnBundle = {
  /** All ft events of the transaction, in the v3 sort order. */
  fts: TxnFT[];
  /** All nft events of the transaction, in the v3 sort order. */
  nfts: TxnNFT[];
  /** The v3 receipt tree flattened depth-first (preorder), root first. */
  receipts: TxnReceipt[];
  txn: Txn;
};

// Copied from services/v3/txns (which must not be imported): ft events carry an
// extra `event_type` tiebreaker, everything else sorts by timestamp/shard/index.
const sortFtEvents = (events: TxnFT[]): TxnFT[] =>
  events.sort((a, b) => {
    const tsDiff = BigInt(a.block_timestamp) - BigInt(b.block_timestamp);

    if (tsDiff !== 0n) return tsDiff < 0n ? -1 : 1;
    if (a.shard_id !== b.shard_id) return a.shard_id - b.shard_id;
    if (a.event_type !== b.event_type) return a.event_type - b.event_type;

    return a.event_index - b.event_index;
  });

const sortEvents = <
  T extends { block_timestamp: string; event_index: number; shard_id: number },
>(
  events: T[],
): T[] =>
  events.sort((a, b) => {
    const tsDiff = BigInt(a.block_timestamp) - BigInt(b.block_timestamp);

    if (tsDiff !== 0n) return tsDiff < 0n ? -1 : 1;
    if (a.shard_id !== b.shard_id) return a.shard_id - b.shard_id;

    return a.event_index - b.event_index;
  });

/**
 * v1/v2 emitted one `receipts[]` entry per row of `receipts` ordered by the
 * legacy DB's `receipts.id` (insertion order). That column does not exist in the
 * split schema, so the replacement is a depth-first preorder walk of v3's
 * receipt tree — the same parent-before-child ordering `id ASC` produced.
 */
const flattenReceipts = (root: null | TxnReceipt): TxnReceipt[] => {
  const flat: TxnReceipt[] = [];

  const walk = (node: TxnReceipt) => {
    flat.push(node);
    (node.receipts ?? []).forEach(walk);
  };

  if (root) walk(root);

  return flat;
};

/** Buckets ft/nft event rows by the receipt that emitted them, order preserved. */
export const groupByReceipt = <T extends { receipt_id: string }>(
  rows: T[],
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.receipt_id);

    if (bucket) bucket.push(row);
    else grouped.set(row.receipt_id, [row]);
  }

  return grouped;
};

/**
 * Loads everything the `/{hash}`, `/{hash}/full` and `/v2/txns/{hash}` shapes
 * need, mirroring the orchestration of the v3 `txn`, `receipts`, `fts` and
 * `nfts` handlers: the txn row and the receipt tree come off `dbBase` through a
 * rolling window, the receipt list from `events`/`eventsRlp`, and the ft/nft
 * rows from a `UNION ALL` of per-receipt statements run on `dbEvents`.
 *
 * The v3 `fts` and `nfts` handlers each re-run the receipt list query; the proxy
 * runs it once and feeds both unions, which is the same query with one fewer
 * round trip.
 */
export const loadTxnBundle = async (
  hash: string,
): Promise<null | TxnBundle> => {
  const rlp = hash.startsWith('0x');
  const cteSql = rlp ? sql.rlpCte : sql.txnCte;
  const eventsSql = rlp ? sql.eventsRlp : sql.events;

  const txn = await rollingWindow<Txn>(
    (start, end) => {
      const cte = pgp.as.format(cteSql, { end, hash, start });

      return dbBase.oneOrNone<Txn>(sql.txn, { cte });
    },
    { start: config.baseStart },
  );

  if (!txn) return null;

  const [tree, eventReceipts] = await Promise.all([
    rollingWindow<TxnReceipt>(
      (start, end) => {
        const cte = pgp.as.format(cteSql, { end, hash, start });

        return dbBase.oneOrNone<TxnReceipt>(sql.receipts, { cte });
      },
      { start: config.baseStart },
    ),
    rollingWindow<EventReceipt[]>(
      async (start, end) => {
        const rows = await dbBase.any<EventReceipt>(eventsSql, {
          end,
          hash,
          start,
        });

        return rows.length ? rows : null;
      },
      { start: config.baseStart },
    ),
  ]);

  const union = (statement: typeof sql.ft) =>
    (eventReceipts ?? [])
      .map((receipt) => pgp.as.format(statement, receipt))
      .join('\nUNION ALL\n');

  const [fts, nfts] = eventReceipts?.length
    ? await Promise.all([
        dbEvents.manyOrNone<TxnFT>(union(sql.ft)),
        dbEvents.manyOrNone<TxnNFT>(union(sql.nft)),
      ])
    : [[], []];

  return {
    fts: sortFtEvents(fts),
    nfts: sortEvents(nfts),
    receipts: flattenReceipts(tree),
    txn,
  };
};

/**
 * v1 embedded ft event. `event_index` is `null`: v3's is a small per-shard
 * counter, not v1's global composite index (same call as in proxy/fts.ts).
 * `ft_meta` drops v3's `reference`, which v1 never selected.
 */
const legacyFt = (ft: TxnFT) => ({
  affected_account_id: ft.affected_account_id,
  block_timestamp: toNumber(ft.block_timestamp),
  cause: ft.cause,
  delta_amount: toNumber(ft.delta_amount),
  event_index: null,
  ft_meta: ft.meta
    ? {
        contract: ft.meta.contract,
        decimals: ft.meta.decimals,
        icon: ft.meta.icon,
        name: ft.meta.name,
        symbol: ft.meta.symbol,
      }
    : null,
  involved_account_id: ft.involved_account_id,
});

/**
 * v1 embedded nft event. `event_index` -> `null` as above; `nft_token_meta`
 * drops v3's `contract`, which v1 never selected.
 */
const legacyNft = (nft: TxnNFT) => ({
  affected_account_id: nft.affected_account_id,
  block_timestamp: toNumber(nft.block_timestamp),
  cause: nft.cause,
  delta_amount: toNumber(nft.delta_amount),
  event_index: null,
  involved_account_id: nft.involved_account_id,
  nft_meta: nft.meta
    ? {
        base_uri: nft.meta.base_uri,
        contract: nft.meta.contract,
        icon: nft.meta.icon,
        name: nft.meta.name,
        reference: nft.meta.reference,
        symbol: nft.meta.symbol,
      }
    : null,
  nft_token_meta: nft.token_meta
    ? {
        media: nft.token_meta.media,
        reference: nft.token_meta.reference,
        title: nft.token_meta.title,
        token: nft.token_meta.token,
      }
    : null,
  token_id: nft.token_id,
});

/**
 * The transaction-level columns shared by `/{hash}` and `/{hash}/full`. v1
 * emitted these through `JSON_BUILD_OBJECT` without a `::TEXT` cast, so the
 * aggregates and the block height are JSON numbers; v3 casts them to text, and
 * `toNumber` reproduces v1's >2^53 precision loss. `block_timestamp` and the
 * two `receipt_conversion_*` columns were raw numerics that the legacy driver
 * already surfaced as strings, so those stay strings.
 */
const legacyTxn = (txn: Txn) => ({
  actions_agg: {
    deposit: toNumber(txn.actions_agg?.deposit),
    gas_attached: toNumber(txn.actions_agg?.gas_attached),
  },
  block: { block_height: toNumber(txn.block?.block_height) },
  block_timestamp: txn.block_timestamp,
  included_in_block_hash: txn.block?.block_hash ?? null,
  outcomes: { status: txn.outcomes?.status ?? null },
  outcomes_agg: {
    gas_used: toNumber(txn.outcomes_agg?.gas_used),
    transaction_fee: toNumber(txn.outcomes_agg?.transaction_fee),
  },
  receipt_conversion_gas_burnt: txn.receipt_conversion_gas_burnt,
  receipt_conversion_tokens_burnt: txn.receipt_conversion_tokens_burnt,
  receiver_account_id: txn.receiver_account_id,
  // v1 read shard_id off the legacy DB's `chunks` table as a wide numeric, which
  // the driver surfaced as a string; v3's is a smallint. Verified against
  // production: /v1/txns/{hash} emits "4", /v3/txns/{hash} emits 4.
  shard_id: toStringOrNull(txn.shard_id),
  signer_account_id: txn.signer_account_id,
  transaction_hash: txn.transaction_hash,
});

/**
 * GET /v1/txns/{hash}
 *
 * Non-1:1:
 * - `actions[].args` is re-serialized from v3's nested `args_json` so it stays
 *   the JSON *string* v1 emitted (see `legacyArgs`); verified against the
 *   production v1 response. The only divergence is whitespace (Postgres'
 *   jsonb text output spaces after `:`) and precision for an integer literal
 *   above 2^53 inside args_json.
 * - `receipts[]` is rebuilt from v3's receipt tree (see `flattenReceipts`), so
 *   it holds only ACTION receipts in preorder. v1 listed every receipt of the
 *   transaction ordered by `included_in_block_timestamp ASC`, data receipts
 *   included; those carry no ft/nft events, so no event is lost, but the array
 *   is shorter and ordered differently. Entries keep v1's `{fts, nfts}` shape.
 * - Events whose contract has no synced `ft_meta`/`nft_meta` row disappear:
 *   the v3 event statements inner-join metadata with `modified_at IS NOT NULL`,
 *   where v1 left-joined and emitted the event with a null `ft_meta`.
 * - Per-event `event_index` -> `null`; numeric coercions per `legacyTxn`.
 * - `shard_id` is emitted as a string to match production v1 (the legacy DB's
 *   `chunks.shard_id` was a wide numeric the driver surfaced as text), even
 *   though v3's column is a smallint.
 * - A hash outside the rolling window from `config.baseStart` returns
 *   `{txns: []}`, as an unknown hash always did.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const bundle = await loadTxnBundle(req.validator.data.hash);

  if (!bundle) return res.status(200).json({ txns: [] });

  const fts = groupByReceipt(bundle.fts);
  const nfts = groupByReceipt(bundle.nfts);

  const txn = {
    ...legacyTxn(bundle.txn),
    actions: (bundle.txn.actions ?? []).map((action) => ({
      action: action.action,
      args: legacyArgs(action.args),
      method: action.method,
    })),
    // v1's `item` receipts carried only the two event lists, nothing else.
    receipts: bundle.receipts.map((receipt) => ({
      fts: (fts.get(receipt.receipt_id) ?? []).map(legacyFt),
      nfts: (nfts.get(receipt.receipt_id) ?? []).map(legacyNft),
    })),
  };

  return res.status(200).json({ txns: [txn] });
});

/**
 * GET /v1/txns/{hash}/full
 *
 * Same assembly and same non-1:1 notes as `/{hash}` above, plus:
 * - `receipts[].receipt_kind` is the constant `'ACTION'`. The split-DB
 *   `receipt_tree` function selects `receipt_kind = 'ACTION'` and does not emit
 *   the column, so every node is an action receipt by construction.
 * - `receipts[].block.block_height`/`block_timestamp` and
 *   `receipts[].outcome.gas_burnt`/`tokens_burnt` are coerced back to JSON
 *   numbers (v1 emitted them uncast through `ROW_TO_JSON`, v3 casts to text).
 * - `receipts[].outcome.logs` comes from the tree's `jsonb_to_text(logs)`, so a
 *   log line that was a bare JSON number is now that number as a string. NEAR
 *   logs are strings, so in practice this is a no-op.
 * - `actions[].args_full` is faithful — it is v1's raw `args` jsonb, which is
 *   exactly what v3 puts in `actions[].args`.
 */
const full = catchAsync(async (req: RequestValidator<Full>, res: Response) => {
  const bundle = await loadTxnBundle(req.validator.data.hash);

  if (!bundle) return res.status(200).json({ txns: [] });

  const fts = groupByReceipt(bundle.fts);
  const nfts = groupByReceipt(bundle.nfts);

  const txn = {
    ...legacyTxn(bundle.txn),
    actions: (bundle.txn.actions ?? []).map((action) => ({
      action: action.action,
      args: legacyArgs(action.args),
      args_full: action.args ?? null,
      method: action.method,
    })),
    receipts: bundle.receipts.map((receipt) => ({
      block: {
        block_hash: receipt.block?.block_hash ?? null,
        block_height: toNumber(receipt.block?.block_height),
        block_timestamp: toNumber(receipt.block?.block_timestamp),
      },
      fts: (fts.get(receipt.receipt_id) ?? []).map(legacyFt),
      nfts: (nfts.get(receipt.receipt_id) ?? []).map(legacyNft),
      outcome: {
        executor_account_id: receipt.outcome?.executor_account_id ?? null,
        gas_burnt: toNumber(receipt.outcome?.gas_burnt),
        logs: receipt.outcome?.logs ?? null,
        status: receipt.outcome?.status ?? null,
        tokens_burnt: toNumber(receipt.outcome?.tokens_burnt),
      },
      predecessor_account_id: receipt.predecessor_account_id,
      receipt_id: receipt.receipt_id,
      receipt_kind: 'ACTION',
      receiver_account_id: receipt.receiver_account_id,
    })),
  };

  return res.status(200).json({ txns: [txn] });
});

export default { count, full, item, latest, list, schemas };
