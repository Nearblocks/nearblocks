import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import type {
  AccountFTTxn,
  AccountNFTTxn,
  AccountReceipt,
  AccountTxn,
} from 'nb-schemas';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  FtTxnsExport,
  NftTxnsExport,
  ReceiptsExport,
  TxnsExport,
  TxnsOnlyExport,
} from '#libs/schema/account';
import { ReceiptsExport as V2ReceiptsExport } from '#libs/schema/v2/account';
import { msToNsTime, nsToMsTime, tokenAmount, yoctoToNear } from '#libs/utils';
import sql from '#sql/accounts';
import { ActionKind } from '#types/enums';
import { RequestValidator } from '#types/types';

// v1/v2 account CSV export endpoints served by reusing the shared v3 export
// query modules (#sql/accounts + the split DB handles) directly and emitting the
// legacy CSV byte-for-byte: same column headers, same column order, same value
// formatting, same `Content-Type` and same `attachment; filename=txns.csv`
// (the v3 endpoints use receipts.csv / ft-txns.csv / nft-txns.csv — the proxy
// keeps the legacy name). No v3 service file is imported or modified.
//
// `start`/`end` are expressible on every v3 export query (all four take an
// inclusive [start, end] ns range), so nothing here needs `rejected` — the
// bounds are computed with the LEGACY formula (`startOf('day')` for BOTH ends,
// i.e. the `end` day is only covered up to its midnight) rather than the v3
// formula (`endOf('day')` for `end`), so the exported row range is unchanged.

type Column = { header: string; key: string };

/** Rows of #sql/accounts `fts.exportTxn` / `nfts.exportTxn` (keyed by receipt). */
type ExportTxn = {
  block?: {
    block_hash?: string;
    block_height?: string;
    block_timestamp?: string;
  };
  outcomes?: { status?: boolean | null };
  receipt_id: string;
  transaction_hash: string;
};

/**
 * Legacy `start`/`end` (YYYY-MM-DD) -> the inclusive ns bounds of the v3 export
 * queries. Both legacy handlers use `startOf('day')` on both ends; reproduced
 * verbatim so the proxied export covers exactly the legacy row range.
 */
const dateRange = (start: string, end: string) => ({
  end: msToNsTime(dayjs(end, 'YYYY-MM-DD', true).startOf('day').valueOf()),
  start: msToNsTime(dayjs(start, 'YYYY-MM-DD', true).startOf('day').valueOf()),
});

/**
 * Legacy emits `Pending` when the outcome row is missing (its `BOOL_AND` over
 * zero rows is NULL). The v3 queries COALESCE a missing outcome to `{}`, so the
 * status arrives as `undefined` — treated as `Pending` to keep the legacy value.
 */
const statusLabel = (status?: boolean | null): string => {
  if (status === null || status === undefined) return 'Pending';

  return status ? 'Success' : 'Failed';
};

/** Legacy `Method` column: the first action's method, else its action kind. */
const methodLabel = (
  actions?: { action?: string; method?: null | string }[] | null,
): string => {
  const action = actions?.[0]?.action;
  const method = actions?.[0]?.method ?? 'Unknown';

  return !action || action === ActionKind.FUNCTION_CALL ? method : action;
};

/** Legacy `Time` column format. */
const timeLabel = (ns: string) =>
  dayjs(+nsToMsTime(ns)).format('YYYY-MM-DD HH:mm:ss');

/** Legacy headers/attachment name; every legacy export is served as txns.csv. */
const csvStream = (res: Response, next: NextFunction, columns: Column[]) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

  const stringifier = stringify({ columns, header: true });

  stringifier.on('error', (error) => {
    next(error);
  });

  stringifier.pipe(res);

  return stringifier;
};

/**
 * GET /v1/account/{account}/txns/export
 *
 * Reshaped over the v3 account *receipts* export query, which keeps the legacy
 * row set (one row per ACTION receipt where the account is predecessor or
 * receiver) — the v3 txn export would silently drop receipts the account only
 * touched downstream of someone else's transaction.
 *
 * Non-1:1: `Txn Fee` is **empty** — the v3 receipt query carries no
 * `outcomes_agg.transaction_fee` and there is no other v3 source for it.
 * `Deposit Value`, `Status`, `Block` and `Time` come from the receipt itself
 * instead of its originating transaction (legacy joined out to the transaction
 * for those four). The range filter is the receipt timestamp, not the
 * transaction timestamp. Row cap is 5000 per union branch (predecessor /
 * receiver) instead of 5000 overall.
 */
const txnsExport = catchAsync(
  async (
    req: RequestValidator<TxnsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const cte = pgp.as.format(sql.receipts.exportCte, {
      account: data.account,
      end,
      start,
    });
    const rows = await dbBase.manyOrNone<AccountReceipt>(
      sql.receipts.receipts,
      { cte, direction: 'asc' },
    );

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Deposit Value', key: 'deposit' },
      { header: 'Txn Fee', key: 'fee' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    rows.forEach((row) => {
      stringifier.write({
        block: row.block?.block_height ?? '',
        deposit: yoctoToNear(row.actions_agg?.deposit ?? '0'),
        fee: '',
        from: row.predecessor_account_id || 'system',
        hash: row.transaction_hash,
        method: methodLabel(row.actions),
        status: statusLabel(row.outcome?.status),
        timestamp: timeLabel(row.included_in_block_timestamp),
        to: row.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

/**
 * GET /v1/account/{account}/txns-only/export
 *
 * Reshaped over the v3 account txn export query, which is the exact transaction
 * model the legacy handler used.
 *
 * Non-1:1: row cap is 5000 per union branch (signer / receiver) instead of 5000
 * overall. `Deposit Value`/`Txn Fee` are formatted from v3 numeric *strings*
 * rather than the legacy JSON numbers, so very large values keep full precision
 * where legacy could round them.
 */
const txnsOnlyExport = catchAsync(
  async (
    req: RequestValidator<TxnsOnlyExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const cte = pgp.as.format(sql.txns.exportCte, {
      account: data.account,
      end,
      start,
    });
    const rows = await dbBase.manyOrNone<AccountTxn>(sql.txns.txns, {
      cte,
      direction: 'asc',
    });

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Deposit Value', key: 'deposit' },
      { header: 'Txn Fee', key: 'fee' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    rows.forEach((row) => {
      stringifier.write({
        block: row.block?.block_height ?? '',
        deposit: yoctoToNear(row.actions_agg?.deposit ?? '0'),
        fee: yoctoToNear(row.outcomes_agg?.transaction_fee ?? '0'),
        from: row.signer_account_id || 'system',
        hash: row.transaction_hash,
        method: methodLabel(row.actions),
        status: statusLabel(row.outcomes?.status),
        timestamp: timeLabel(row.block_timestamp),
        to: row.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

/**
 * GET /v1/account/{account}/receipts/export
 *
 * Reshaped over the v3 account receipts export query (same receipt model, same
 * `included_in_block_timestamp` range filter as legacy).
 *
 * Non-1:1: `Txn Fee` is **empty** — the v3 receipt query has no
 * `outcomes_agg.transaction_fee`. `Deposit Value` is the receipt's own action
 * deposit (legacy summed the originating transaction's converted receipt), and
 * `Block`/`Time` are the receipt's block (legacy used the originating
 * transaction's block). Row cap is 5000 per union branch instead of 5000
 * overall.
 */
const receiptsExport = catchAsync(
  async (
    req: RequestValidator<ReceiptsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const cte = pgp.as.format(sql.receipts.exportCte, {
      account: data.account,
      end,
      start,
    });
    const rows = await dbBase.manyOrNone<AccountReceipt>(
      sql.receipts.receipts,
      { cte, direction: 'asc' },
    );

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Receipt', key: 'receipt' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Deposit Value', key: 'deposit' },
      { header: 'Txn Fee', key: 'fee' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    rows.forEach((row) => {
      stringifier.write({
        block: row.block?.block_height ?? '',
        deposit: yoctoToNear(row.actions_agg?.deposit ?? '0'),
        fee: '',
        from: row.predecessor_account_id || 'system',
        hash: row.transaction_hash,
        method: methodLabel(row.actions),
        receipt: row.receipt_id,
        status: statusLabel(row.outcome?.status),
        timestamp: timeLabel(row.included_in_block_timestamp),
        to: row.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

/**
 * GET /v2/account/{account}/receipts/export
 *
 * Reshaped over the v3 account receipts export query. Every legacy column has a
 * v3 source here (v2 has no `Txn Fee` column, and its `Block`/`Time` already
 * came from the receipt's own block), so the CSV is faithful.
 *
 * Non-1:1: row cap is 5000 per union branch (predecessor / receiver) instead of
 * 5000 overall, and the v3 CTE additionally requires the receipt to have at
 * least one action row.
 */
const receiptsExportV2 = catchAsync(
  async (
    req: RequestValidator<V2ReceiptsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const cte = pgp.as.format(sql.receipts.exportCte, {
      account: data.account,
      end,
      start,
    });
    const rows = await dbBase.manyOrNone<AccountReceipt>(
      sql.receipts.receipts,
      { cte, direction: 'asc' },
    );

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Receipt', key: 'receipt' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Deposit Value', key: 'deposit' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    rows.forEach((row) => {
      stringifier.write({
        block: row.block?.block_height ?? '',
        deposit: yoctoToNear(row.actions_agg?.deposit ?? '0'),
        from: row.predecessor_account_id || 'system',
        hash: row.transaction_hash,
        method: methodLabel(row.actions),
        receipt: row.receipt_id,
        status: statusLabel(row.outcome?.status),
        timestamp: timeLabel(
          row.block?.block_timestamp ?? row.included_in_block_timestamp,
        ),
        to: row.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

/**
 * GET /v1/account/{account}/ft-txns/export
 *
 * Reshaped over the v3 FT export query: events from `dbEvents`, then the
 * originating transaction/block/outcome for those receipts from `dbBase`
 * (legacy did it in one join).
 *
 * Non-1:1: the range filter is the *event* timestamp; legacy filtered on the
 * originating transaction's block timestamp. Events whose receipt has no
 * transaction row in `dbBase` were dropped by legacy's inner join but are kept
 * here with an empty `Txn Hash`/`Block` and a `Pending` status. Token metadata
 * comes from `ft_meta` rows with `modified_at` set, so an event on a
 * never-synced contract drops out (legacy only required the row to exist);
 * `Quantity` falls back to the raw `delta_amount` when the contract has no
 * `decimals`, where legacy would fail.
 */
const ftTxnsExport = catchAsync(
  async (
    req: RequestValidator<FtTxnsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const events = await dbEvents.manyOrNone<AccountFTTxn>(sql.fts.export, {
      account: data.account,
      end,
      start,
    });

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Affected', key: 'affected' },
      { header: 'Involved', key: 'involved' },
      { header: 'Direction', key: 'direction' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Token', key: 'token' },
      { header: 'Contract', key: 'contract' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    if (events.length) {
      const ids = events.map((event) => event.receipt_id);
      const txnRows = await dbBase.manyOrNone<ExportTxn>(sql.fts.exportTxn, {
        ids,
      });
      const txnMap = new Map(txnRows.map((txn) => [txn.receipt_id, txn]));

      events.forEach((event) => {
        const txn = txnMap.get(event.receipt_id);
        const meta = event.meta;

        stringifier.write({
          affected: event.affected_account_id || 'system',
          block: txn?.block?.block_height ?? '',
          contract: meta?.contract ?? '',
          direction: BigInt(event.delta_amount) > 0n ? 'In' : 'Out',
          hash: txn?.transaction_hash ?? '',
          involved: event.involved_account_id || 'system',
          method: event.cause,
          quantity:
            meta?.decimals === null || meta?.decimals === undefined
              ? event.delta_amount
              : tokenAmount(event.delta_amount, meta.decimals),
          status: statusLabel(txn?.outcomes?.status),
          timestamp: timeLabel(
            txn?.block?.block_timestamp ?? event.block_timestamp,
          ),
          token: meta ? `${meta.name} (${meta.symbol})` : '',
        });
      });
    }

    stringifier.end();
  },
);

/**
 * GET /v1/account/{account}/nft-txns/export
 *
 * Reshaped over the v3 NFT export query (events from `dbEvents` + originating
 * transaction from `dbBase`). The legacy column list is reproduced verbatim,
 * including the duplicated `Token` header at position 7 that legacy fills with
 * the *involved* account — v3's own CSV drops that column, the proxy keeps it.
 *
 * Non-1:1: same caveats as the FT export — event-timestamp range filter instead
 * of transaction-timestamp, events without a `dbBase` transaction row are kept
 * with empty `Txn Hash`/`Block`, and metadata requires `modified_at` on both
 * `nft_meta` and `nft_token_meta`.
 */
const nftTxnsExport = catchAsync(
  async (
    req: RequestValidator<NftTxnsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const data = req.validator.data;
    const { end, start } = dateRange(data.start, data.end);

    const events = await dbEvents.manyOrNone<AccountNFTTxn>(sql.nfts.export, {
      account: data.account,
      end,
      start,
    });

    const stringifier = csvStream(res, next, [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Affected', key: 'affected' },
      { header: 'Involved', key: 'involved' },
      { header: 'Direction', key: 'direction' },
      { header: 'Token', key: 'involved' },
      { header: 'Token ID', key: 'id' },
      { header: 'Token', key: 'token' },
      { header: 'Contract', key: 'contract' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ]);

    if (events.length) {
      const ids = events.map((event) => event.receipt_id);
      const txnRows = await dbBase.manyOrNone<ExportTxn>(sql.nfts.exportTxn, {
        ids,
      });
      const txnMap = new Map(txnRows.map((txn) => [txn.receipt_id, txn]));

      events.forEach((event) => {
        const txn = txnMap.get(event.receipt_id);
        const meta = event.meta;

        stringifier.write({
          affected: event.affected_account_id || 'system',
          block: txn?.block?.block_height ?? '',
          contract: meta?.contract ?? '',
          direction: BigInt(event.delta_amount) > 0n ? 'In' : 'Out',
          hash: txn?.transaction_hash ?? '',
          id: event.token_id,
          involved: event.involved_account_id || 'system',
          method: event.cause,
          status: statusLabel(txn?.outcomes?.status),
          timestamp: timeLabel(
            txn?.block?.block_timestamp ?? event.block_timestamp,
          ),
          token: meta ? `${meta.name} (${meta.symbol})` : '',
        });
      });
    }

    stringifier.end();
  },
);

export default {
  ftTxnsExport,
  nftTxnsExport,
  receiptsExport,
  receiptsExportV2,
  txnsExport,
  txnsOnlyExport,
};
