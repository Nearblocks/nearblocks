import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import { FtTxns, FtTxnsCount, FtTxnsExport } from '#libs/schema/account';
import {
  getPagination,
  keyBinder,
  msToNsTime,
  nsToMsTime,
  tokenAmount,
} from '#libs/utils';
import { RawQueryParams, RequestValidator } from '#types/types';

const txns = catchAsync(
  async (req: RequestValidator<FtTxns>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
    const event = req.validator.data.event;
    const cursor = req.validator.data.cursor?.replace('n', '');
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;
    const afterDate = req.validator.data.after_date;
    const beforeDate = req.validator.data.before_date;
    let afterTimestamp = null;
    let beforeTimestamp = null;

    if (afterDate) {
      afterTimestamp = msToNsTime(
        dayjs(afterDate, 'YYYY-MM-DD', true)
          .add(1, 'day')
          .startOf('day')
          .valueOf(),
      );
    }
    if (beforeDate) {
      beforeTimestamp = msToNsTime(
        dayjs(beforeDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
      );
    }

    const { limit, offset } = getPagination(page, per_page);
    const txns = await sql`
      SELECT
        event_index,
        affected_account_id,
        involved_account_id,
        delta_amount,
        cause,
        txn.transaction_hash,
        txn.included_in_block_hash,
        txn.block_timestamp,
        txn.block,
        txn.outcomes,
        txn.outcomes_agg,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'contract',
              contract,
              'name',
              name,
              'symbol',
              symbol,
              'decimals',
              decimals,
              'icon',
              icon,
              'reference',
              reference
            )
          FROM
            ft_meta
          WHERE
            ft_meta.contract = contract_account_id
        ) AS ft
      FROM
        ft_events
        INNER JOIN (
          SELECT
            event_index
          FROM
            ft_events a
          WHERE
            affected_account_id = ${account}
            AND ${involved ? sql`involved_account_id = ${involved}` : true}
            AND ${event ? sql`cause = ${event}` : true}
            AND ${cursor
        ? sql`event_index ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
        : true}
            AND ${afterTimestamp
        ? sql`block_timestamp >= ${afterTimestamp}`
        : true}
            AND ${beforeTimestamp
        ? sql`block_timestamp < ${beforeTimestamp}`
        : true}
            AND EXISTS (
              SELECT
                1
              FROM
                ft_meta ft
              WHERE
                ft.contract = a.contract_account_id
            )
            AND EXISTS (
              SELECT
                1
              FROM
                transactions
                JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
              WHERE
                receipts.receipt_id = a.receipt_id
            )
          ORDER BY
            event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
          LIMIT
            ${limit}
          OFFSET
            ${cursor ? 0 : offset}
        ) AS tmp using (event_index)
        INNER JOIN LATERAL (
          SELECT
            transactions.transaction_hash,
            transactions.included_in_block_hash,
            transactions.block_timestamp,
            (
              SELECT
                JSON_BUILD_OBJECT('block_height', block_height)
              FROM
                blocks
              WHERE
                blocks.block_hash = transactions.included_in_block_hash
            ) AS block,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'status',
                  BOOL_AND(
                    CASE
                      WHEN status = 'SUCCESS_RECEIPT_ID'
                      OR status = 'SUCCESS_VALUE' THEN TRUE
                      ELSE FALSE
                    END
                  )
                )
              FROM
                execution_outcomes
              WHERE
                execution_outcomes.receipt_id = transactions.converted_into_receipt_id
            ) AS outcomes,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'transaction_fee',
                  COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0)
                )
              FROM
                execution_outcomes
                JOIN receipts ON receipts.receipt_id = execution_outcomes.receipt_id
              WHERE
                receipts.originated_from_transaction_hash = transactions.transaction_hash
            ) AS outcomes_agg
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = ft_events.receipt_id
        ) txn ON TRUE
      ORDER BY
        event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
    `;

    let nextCursor = txns?.[txns?.length - 1]?.event_index;
    nextCursor =
      txns?.length === per_page && nextCursor ? `${nextCursor}n` : undefined;

    return res.status(200).json({ cursor: nextCursor, txns });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
    const event = req.validator.data.event;
    const afterDate = req.validator.data.after_date;
    const beforeDate = req.validator.data.before_date;
    let afterTimestamp: null | string = null;
    let beforeTimestamp: null | string = null;

    if (afterDate) {
      afterTimestamp = msToNsTime(
        dayjs(afterDate, 'YYYY-MM-DD', true)
          .add(1, 'day')
          .startOf('day')
          .valueOf(),
      );
    }
    if (beforeDate) {
      beforeTimestamp = msToNsTime(
        dayjs(beforeDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
      );
    }

    const useFormat = true;
    const bindings = {
      account,
      afterTimestamp,
      beforeTimestamp,
      event,
      involved,
    };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        ft_events a
      WHERE
        affected_account_id = :account
        AND ${involved ? `involved_account_id = :involved` : true}
        AND ${event ? `cause = :event` : true}
        AND ${afterTimestamp ? `block_timestamp >= :afterTimestamp` : true}
        AND ${beforeTimestamp ? `block_timestamp < :beforeTimestamp` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            ft_meta ft
          WHERE
            ft.contract = a.contract_account_id
        )
        AND EXISTS (
          SELECT
            1
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = a.receipt_id
        )
    `;

    const { query, values } = keyBinder(
      rawQuery({ select: 'receipt_id' }),
      bindings,
      useFormat,
    );

    const { rows } = await db.query(
      `SELECT cost, rows as count FROM count_cost_estimate(${query})`,
      values,
    );

    const cost = +rows?.[0]?.cost;
    const count = +rows?.[0]?.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return res.status(200).json({ txns: rows });
    }

    const { query: countQuery, values: countValues } = keyBinder(
      rawQuery({ select: 'COUNT(receipt_id)' }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

const txnsExport = catchAsync(
  async (
    req: RequestValidator<FtTxnsExport>,
    res: Response,
    next: NextFunction,
  ) => {
    const account = req.validator.data.account;
    const start = msToNsTime(
      dayjs(req.validator.data.start, 'YYYY-MM-DD', true)
        .startOf('day')
        .valueOf(),
    );
    const end = msToNsTime(
      dayjs(req.validator.data.end, 'YYYY-MM-DD', true)
        .startOf('day')
        .valueOf(),
    );

    const txns = await sql`
      SELECT
        event_index,
        affected_account_id,
        involved_account_id,
        delta_amount,
        cause,
        txn.transaction_hash,
        txn.included_in_block_hash,
        txn.block_timestamp,
        txn.block,
        txn.outcomes,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'contract',
              contract,
              'name',
              name,
              'symbol',
              symbol,
              'decimals',
              decimals,
              'icon',
              icon,
              'reference',
              reference
            )
          FROM
            ft_meta
          WHERE
            ft_meta.contract = contract_account_id
        ) AS ft
      FROM
        ft_events
        INNER JOIN (
          SELECT
            event_index
          FROM
            ft_events a
            JOIN receipts r ON r.receipt_id = a.receipt_id
            JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
          WHERE
            affected_account_id = ${account}
            AND EXISTS (
              SELECT
                1
              FROM
                ft_meta ft
              WHERE
                ft.contract = a.contract_account_id
            )
            AND EXISTS (
              SELECT
                1
              FROM
                transactions
                JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
              WHERE
                receipts.receipt_id = a.receipt_id
            )
            AND t.block_timestamp BETWEEN ${start} AND ${end}
          ORDER BY
            event_index ASC
          LIMIT
            5000
        ) AS tmp using (event_index)
        INNER JOIN LATERAL (
          SELECT
            transactions.transaction_hash,
            transactions.included_in_block_hash,
            transactions.block_timestamp,
            (
              SELECT
                JSON_BUILD_OBJECT('block_height', block_height)
              FROM
                blocks
              WHERE
                blocks.block_hash = transactions.included_in_block_hash
            ) AS block,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'status',
                  BOOL_AND(
                    CASE
                      WHEN status = 'SUCCESS_RECEIPT_ID'
                      OR status = 'SUCCESS_VALUE' THEN TRUE
                      ELSE FALSE
                    END
                  )
                )
              FROM
                execution_outcomes
              WHERE
                execution_outcomes.receipt_id = transactions.converted_into_receipt_id
            ) AS outcomes
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = ft_events.receipt_id
        ) txn ON TRUE
      ORDER BY
        event_index ASC
    `;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
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
      ],
      header: true,
    });

    stringifier.on('error', (error) => {
      next(error);
    });

    stringifier.pipe(res);

    txns.forEach((txn) => {
      const status = txn.outcomes.status;

      stringifier.write({
        affected: txn.affected_account_id || 'system',
        block: txn.block.block_height,
        contract: txn.ft ? txn.ft.contract : '',
        direction: txn.delta_amount > 0 ? 'In' : 'Out',
        hash: txn.transaction_hash,
        involved: txn.involved_account_id || 'system',
        method: txn.cause,
        quantity: txn.ft
          ? tokenAmount(txn.delta_amount, txn.ft.decimals)
          : txn.delta_amount,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(txn.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        token: txn.ft ? `${txn.ft.name} (${txn.ft.symbol})` : '',
      });
    });

    stringifier.end();
  },
);

export default { txns, txnsCount, txnsExport };
