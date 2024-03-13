import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import { FtTxns, FtTxnsCount, FtTxnsExport } from '#libs/schema/account';
import { streamCsv } from '#libs/stream';
import {
  getPagination,
  keyBinder,
  msToNsTime,
  nsToMsTime,
  tokenAmount,
} from '#libs/utils';
import {
  RawQueryParams,
  RequestValidator,
  StreamTransformWrapper,
} from '#types/types';

const txns = catchAsync(
  async (req: RequestValidator<FtTxns>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

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
            AND ${involved ? sql` involved_account_id = ${involved}` : true}
            AND ${event ? sql` cause = ${event}` : true}
            AND EXISTS (
              SELECT
                1
              FROM
                ft_meta ft
              WHERE
                ft.contract = a.contract_account_id
            )
          ORDER BY
            event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
          LIMIT
            ${limit}
          OFFSET
            ${offset}
        ) AS tmp using (event_index)
        LEFT JOIN LATERAL (
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
        event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
    `;

    return res.status(200).json({ txns });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
    const event = req.validator.data.event;

    const useFormat = true;
    const bindings = { account, event, involved };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        ft_events a
      WHERE
        affected_account_id = :account
        AND ${involved ? `involved_account_id = :involved` : true}
        AND ${event ? `cause = :event` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            ft_meta ft
          WHERE
            ft.contract = a.contract_account_id
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

    const count = +rows?.[0]?.count;

    if (count > config.maxQueryRows) {
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
  async (req: RequestValidator<FtTxnsExport>, res: Response) => {
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

    const { query, values } = keyBinder(
      `
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
              json_build_object(
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
              affected_account_id = :account
              AND EXISTS (
                SELECT
                  1
                FROM
                  ft_meta ft
                WHERE
                  ft.contract = a.contract_account_id
              )
              AND t.block_timestamp BETWEEN :start AND :end
            ORDER BY
              event_index ASC
            LIMIT
              5000
          ) AS tmp using(
            event_index
          )
          LEFT JOIN LATERAL (
            SELECT
              transactions.transaction_hash,
              transactions.included_in_block_hash,
              transactions.block_timestamp,
              (
                SELECT
                  json_build_object(
                    'block_height',
                    block_height
                  )
                FROM
                  blocks
                WHERE
                  blocks.block_hash = transactions.included_in_block_hash
              ) AS block,
              (
                SELECT
                  json_build_object(
                    'status',
                    BOOL_AND (
                      CASE WHEN status = 'SUCCESS_RECEIPT_ID'
                      OR status = 'SUCCESS_VALUE' THEN TRUE ELSE FALSE END
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
      `,
      { account, end, start },
    );

    const columns = [
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
    ];
    const transform: StreamTransformWrapper =
      (stringifier) => (row, _, callback) => {
        const status = row.outcomes.status;

        stringifier.write({
          affected: row.affected_account_id || 'system',
          block: row.block.block_height,
          contract: row.ft ? row.ft.contract : '',
          direction: row.delta_amount > 0 ? 'In' : 'Out',
          hash: row.transaction_hash,
          involved: row.involved_account_id || 'system',
          method: row.cause,
          quantity: row.ft
            ? tokenAmount(row.delta_amount, row.ft.decimals)
            : row.delta_amount,
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          timestamp: dayjs(+nsToMsTime(row.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          token: row.ft ? `${row.ft.name} (${row.ft.symbol})` : '',
        });
        callback();
      };

    return streamCsv(res, query, values, columns, transform);
  },
);

export default { txns, txnsCount, txnsExport };
