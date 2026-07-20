import { Response } from 'express';

import type { TxnFT, TxnNFT, TxnReceipt } from 'nb-schemas';

import config from '#config';
import catchAsync from '#libs/async';
import { dbBase, pgp } from '#libs/pgp';
import { toNumber, toStringOrNull } from '#libs/proxy';
import { rollingWindow } from '#libs/response';
import { Txn, TxnReceipts } from '#libs/schema/v2/txns';
import { groupByReceipt, loadTxnBundle } from '#services/proxy/txns';
import sql from '#sql/txns';
import { RequestValidator } from '#types/types';

// v2 transaction endpoints served by reusing the shared v3 txn query modules
// (#sql/txns + #libs/response) and reformatting to the legacy v2 JSON shape.
// No v3 service file is imported or modified; the orchestration mirrors
// services/v3/txns.
//
// `GET /v2/txns/{hash}` reuses the loader in services/proxy/txns.ts (txn row +
// receipt tree + per-receipt ft/nft events) and reshapes it into the v2 wire
// shape, which keeps the big integers as strings where the legacy SQL cast them
// with `::TEXT`.

/**
 * GET /v2/txns/{hash}/receipts
 *
 * Both versions call the same `receipt_tree` SQL function; v3 unwraps the JSONB
 * object into top-level columns, so the proxy re-nests it under `receipt_tree`
 * to restore the v2 row shape.
 *
 * Non-1:1: the split-DB `receipt_tree` selects `receipt_kind = 'ACTION'` and
 * does not emit `receipt_kind`, so a v2 client reading that key on a node of
 * the tree no longer finds it — every node is an action receipt by definition.
 */
const txnReceipts = catchAsync(
  async (req: RequestValidator<TxnReceipts>, res: Response) => {
    const hash = req.validator.data.hash;
    const cteSql = hash.startsWith('0x') ? sql.rlpCte : sql.txnCte;

    const tree = await rollingWindow<TxnReceipt>(
      (start, end) => {
        const cte = pgp.as.format(cteSql, { end, hash, start });

        return dbBase.oneOrNone<TxnReceipt>(sql.receipts, { cte });
      },
      { start: config.baseStart },
    );

    const receipts = tree ? [{ receipt_tree: tree }] : [];

    return res.status(200).json({ receipts });
  },
);

/**
 * JS equivalent of the split DB's `jsonb_to_text` (defined in
 * apps/indexer-base/migrations/20250613154112_index.up.sql): recursively
 * replaces every JSON *number* leaf with its text form, leaving object and
 * array structure, strings, booleans and nulls untouched.
 *
 * v2's legacy SQL wrapped `action_receipt_actions.args` in that function, so
 * production `/v2/txns/{hash}` returns e.g. `{"gas": "30000000000000", ...}`.
 * The v3 receipt tree does NOT apply it (verified against production: the tree
 * returns `"gas": 30000000000000`), so the proxy applies it here.
 *
 * Caveat: a number above 2^53 has already lost precision in the driver's JSON
 * parse, where Postgres converted it server-side losslessly.
 */
const jsonbToText = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(jsonbToText);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        jsonbToText(val),
      ]),
    );
  }

  return typeof value === 'number' ? String(value) : value;
};

/**
 * v2 embedded ft event. Legacy cast `delta_amount` and `block_timestamp` to
 * `::TEXT`, which is what v3 already emits, so no coercion is needed here.
 * `event_index` -> `null` (v3's is a per-shard counter, not v1/v2's global
 * composite index) and `ft_meta` drops v3's `reference`, which v2 never
 * selected.
 */
const legacyFt = (ft: TxnFT) => ({
  affected_account_id: ft.affected_account_id,
  block_timestamp: ft.block_timestamp,
  cause: ft.cause,
  delta_amount: ft.delta_amount,
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
 * v2 embedded nft event. Legacy left `delta_amount` uncast (a JSON number) and
 * cast `block_timestamp` to `::TEXT`; v3 matches both. `nft_token_meta` drops
 * v3's `contract`, which v2 never selected.
 */
const legacyNft = (nft: TxnNFT) => ({
  affected_account_id: nft.affected_account_id,
  block_timestamp: nft.block_timestamp,
  cause: nft.cause,
  delta_amount: nft.delta_amount,
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
 * GET /v2/txns/{hash}
 *
 * Assembled from the same three sources as `/v1/txns/{hash}/full` (see
 * services/proxy/txns.ts) but with the v2 value types: everything the legacy
 * SQL cast with `::TEXT` — `block_timestamp`, `actions_agg.*`,
 * `outcomes_agg.*`, `outcome.gas_burnt`/`tokens_burnt`, ft `delta_amount` —
 * stays a string, and only `block.block_height` (which legacy fed uncast into
 * `JSONB_BUILD_OBJECT`) is coerced back to a JSON number.
 *
 * Non-1:1:
 * - `receipts[]` is v3's receipt tree flattened depth-first, so it holds only
 *   ACTION receipts in preorder; v2 listed every receipt of the transaction
 *   ordered by the legacy DB's `receipts.id`. Data receipts emit no ft/nft
 *   events, so no event is lost, but the array is shorter.
 * - `receipts[].receipt_kind` is the constant `'ACTION'` — the split-DB
 *   `receipt_tree` filters on it and does not emit the column.
 * - Events whose contract has no synced `ft_meta`/`nft_meta` row disappear:
 *   the v3 event statements inner-join metadata with `modified_at IS NOT NULL`,
 *   where v2 left-joined and emitted the event with a null meta object.
 * - Per-event `event_index` -> `null`.
 * - `shard_id` is emitted as a string, matching production v2 (the legacy DB's
 *   `chunks.shard_id` was a wide numeric the driver surfaced as text) even
 *   though v3's column is a smallint.
 * - A hash outside the rolling window from `config.baseStart` returns
 *   `{txns: []}`, as an unknown hash always did.
 */
const txn = catchAsync(async (req: RequestValidator<Txn>, res: Response) => {
  const bundle = await loadTxnBundle(req.validator.data.hash);

  if (!bundle) return res.status(200).json({ txns: [] });

  const fts = groupByReceipt(bundle.fts);
  const nfts = groupByReceipt(bundle.nfts);
  // The tree root is `converted_into_receipt_id` — the exact receipt v2 read its
  // top-level `outcomes` from, and the only place the split schema exposes that
  // outcome's `logs`/`result`.
  const root = bundle.receipts[0];

  const txns = [
    {
      // v2 emitted `jsonb_to_text(args)` (every numeric leaf stringified); the
      // tree's actions are built the same way, while `sql.txn` returns the raw
      // jsonb. Both lists come from the same receipt ordered by
      // `index_in_action_receipt`, so they align by index.
      actions: (bundle.txn.actions ?? []).map((action, index) => ({
        action: action.action,
        args: jsonbToText(action.args ?? root?.actions?.[index]?.args ?? null),
        method: action.method,
      })),
      actions_agg: {
        deposit: bundle.txn.actions_agg?.deposit ?? null,
        gas_attached: bundle.txn.actions_agg?.gas_attached ?? null,
      },
      block: {
        block_hash: bundle.txn.block?.block_hash ?? null,
        block_height: toNumber(bundle.txn.block?.block_height),
        block_timestamp: bundle.txn.block?.block_timestamp ?? null,
      },
      outcomes: {
        logs: root?.outcome?.logs ?? null,
        result: root?.outcome?.result ?? null,
        status: bundle.txn.outcomes?.status ?? null,
        status_key: bundle.txn.outcomes?.status_key ?? null,
      },
      outcomes_agg: {
        gas_used: bundle.txn.outcomes_agg?.gas_used ?? null,
        transaction_fee: bundle.txn.outcomes_agg?.transaction_fee ?? null,
      },
      receipt_conversion_gas_burnt: bundle.txn.receipt_conversion_gas_burnt,
      receipt_conversion_tokens_burnt:
        bundle.txn.receipt_conversion_tokens_burnt,
      receipts: bundle.receipts.map((receipt) => ({
        block: {
          block_hash: receipt.block?.block_hash ?? null,
          block_height: toNumber(receipt.block?.block_height),
          block_timestamp: receipt.block?.block_timestamp ?? null,
        },
        fts: (fts.get(receipt.receipt_id) ?? []).map(legacyFt),
        nfts: (nfts.get(receipt.receipt_id) ?? []).map(legacyNft),
        outcome: {
          executor_account_id: receipt.outcome?.executor_account_id ?? null,
          gas_burnt: receipt.outcome?.gas_burnt ?? null,
          logs: receipt.outcome?.logs ?? null,
          result: receipt.outcome?.result ?? null,
          status: receipt.outcome?.status ?? null,
          status_key: receipt.outcome?.status_key ?? null,
          tokens_burnt: receipt.outcome?.tokens_burnt ?? null,
        },
        predecessor_account_id: receipt.predecessor_account_id,
        receipt_id: receipt.receipt_id,
        receipt_kind: 'ACTION',
        receiver_account_id: receipt.receiver_account_id,
      })),
      receiver_account_id: bundle.txn.receiver_account_id,
      shard_id: toStringOrNull(bundle.txn.shard_id),
      signer_account_id: bundle.txn.signer_account_id,
      transaction_hash: bundle.txn.transaction_hash,
    },
  ];

  return res.status(200).json({ txns });
});

export default { txn, txnReceipts };
