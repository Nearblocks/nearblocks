import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import {
  Receipts,
  ReceiptsCount,
  ReceiptsExport,
} from '#libs/schema/v2/account';
import { keyBinder, msToNsTime, nsToMsTime, yoctoToNear } from '#libs/utils';
import { ActionKind } from '#types/enums';
import { RawQueryParams, RequestValidator } from '#types/types';

const receipts = catchAsync(
  async (req: RequestValidator<Receipts>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;
    const cursor = req.validator.data.cursor;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;
    const afterTimestamp = req.validator.data.after_timestamp;
    const beforeTimestamp = req.validator.data.before_timestamp;

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const cursors = cursor
      ? sql`r.id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
      : true;
    const after = afterTimestamp
      ? sql`r.included_in_block_timestamp > ${afterTimestamp}`
      : true;
    const before = beforeTimestamp
      ? sql`r.included_in_block_timestamp < ${beforeTimestamp}`
      : true;
    const sort = order === 'desc' ? sql`DESC` : sql`ASC`;
    const actions =
      action || method
        ? sql`
            EXISTS (
              SELECT
                1
              FROM
                action_receipt_actions a
              WHERE
                a.receipt_id = r.receipt_id
                AND ${action ? sql`a.action_kind = ${action}` : true}
                AND ${method ? sql`a.args ->> 'method_name' = ${method}` : true}
            )
          `
        : true;
    const union = sql`
      SELECT
        receipt_id
      FROM
        (
          (
            SELECT
              r.id,
              r.receipt_id
            FROM
              receipts r
            WHERE
              r.receipt_kind = 'ACTION'
              AND r.predecessor_account_id = ${account}
              AND ${cursors}
              AND ${actions}
              AND ${after}
              AND ${before}
            ORDER BY
              r.id ${sort}
            LIMIT
              ${per_page}
          )
          UNION
          (
            SELECT
              r.id,
              r.receipt_id
            FROM
              receipts r
            WHERE
              r.receipt_kind = 'ACTION'
              AND r.receiver_account_id = ${account}
              AND ${cursors}
              AND ${actions}
              AND ${after}
              AND ${before}
            ORDER BY
              r.id ${sort}
            LIMIT
              ${per_page}
          )
          ORDER BY
            id ${sort}
          LIMIT
            ${per_page}
        )
    `;
    const intersect = sql`
      SELECT
        r.id,
        r.receipt_id
      FROM
        receipts r
      WHERE
        r.receipt_kind = 'ACTION'
        AND r.predecessor_account_id = ${from ?? account}
        AND r.receiver_account_id = ${to ?? account}
        AND ${cursors}
        AND ${actions}
        AND ${after}
        AND ${before}
      ORDER BY
        r.id ${sort}
      LIMIT
        ${per_page}
    `;

    const txns = await sql`
      SELECT
        r.id,
        r.receipt_id,
        r.originated_from_transaction_hash AS transaction_hash,
        r.predecessor_account_id,
        r.receiver_account_id,
        TO_JSONB(block) AS block,
        TO_JSONB(outcome) AS outcome,
        actions.actions AS actions,
        TO_JSONB(actions_agg) AS actions_agg
      FROM
        receipts r
        INNER JOIN (${from || to ? intersect : union}) AS tmp using (receipt_id)
        LEFT JOIN LATERAL (
          SELECT
            b.block_hash,
            b.block_height,
            b.block_timestamp::TEXT
          FROM
            blocks b
          WHERE
            b.block_hash = r.included_in_block_hash
        ) block ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            eo.gas_burnt::TEXT,
            eo.tokens_burnt::TEXT,
            eo.executor_account_id,
            CASE
              WHEN eo.status = 'SUCCESS_RECEIPT_ID'
              OR eo.status = 'SUCCESS_VALUE' THEN TRUE
              ELSE FALSE
            END AS status
          FROM
            execution_outcomes eo
          WHERE
            eo.receipt_id = r.receipt_id
        ) outcome ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'action',
                ara.action_kind,
                'method',
                ara.args ->> 'method_name',
                'deposit',
                COALESCE((ara.args ->> 'deposit')::NUMERIC, 0)::TEXT,
                'args',
                ara.args ->> 'args_json'
              )
            ) AS actions
          FROM
            action_receipt_actions ara
          WHERE
            ara.receipt_id = r.receipt_id
        ) actions ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(SUM((ara.args ->> 'deposit')::NUMERIC), 0)::TEXT AS deposit
          FROM
            action_receipt_actions ara
          WHERE
            ara.receipt_id = r.receipt_id
        ) actions_agg ON TRUE
      ORDER BY
        r.id ${sort}
    `;

    let nextCursor = txns?.[txns?.length - 1]?.id;
    nextCursor =
      txns?.length === per_page && nextCursor ? nextCursor : undefined;

    return res.status(200).json({ cursor: nextCursor, txns });
  },
);

const receiptsCount = catchAsync(
  async (req: RequestValidator<ReceiptsCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;
    const afterTimestamp = req.validator.data.after_date;
    const beforeTimestamp = req.validator.data.before_date;

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const useFormat = true;
    const bindings = {
      account,
      action,
      afterTimestamp,
      beforeTimestamp,
      from,
      method,
      to,
    };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        receipts r
        JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
      WHERE
        r.receipt_kind = '${options.action}'
        AND ${
          from || to
            ? `
              r.predecessor_account_id = ${from ? `:from` : `:account`}
              AND r.receiver_account_id = ${to ? `:to` : `:account`}
            `
            : `
              (
                r.predecessor_account_id = :account
                OR r.receiver_account_id = :account
              )
            `
        }
        AND ${afterTimestamp ? `t.block_timestamp > :afterTimestamp` : true}
        AND ${beforeTimestamp ? `t.block_timestamp < :beforeTimestamp` : true}
        AND ${
          action || method
            ? `EXISTS (
                SELECT
                  1
                FROM
                  action_receipt_actions a
                WHERE
                  a.receipt_id = r.receipt_id
                  AND ${action ? `a.action_kind = :action` : true}
                  AND ${
                    method ? `a.args ->> '${options.method}' = :method` : true
                  }
              )`
            : true
        }
    `;

    const { query, values } = keyBinder(
      rawQuery({
        action: `'ACTION'`,
        method: `'method_name'`,
        select: 'r.receipt_id',
      }),
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
      rawQuery({
        action: 'ACTION',
        method: 'method_name',
        select: 'COUNT(r.receipt_id)',
      }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

const receiptsExport = catchAsync(
  async (
    req: RequestValidator<ReceiptsExport>,
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

    const receipts = await sql`
      SELECT
        r.receipt_id,
        r.originated_from_transaction_hash,
        r.predecessor_account_id,
        r.receiver_account_id,
        TO_JSONB(block) AS block,
        TO_JSONB(outcome) AS outcome,
        actions.actions AS actions,
        TO_JSONB(actions_agg) AS actions_agg
      FROM
        receipts r
        INNER JOIN (
          SELECT
            r.receipt_id
          FROM
            receipts r
          WHERE
            r.receipt_kind = 'ACTION'
            AND (
              r.predecessor_account_id = ${account}
              OR r.receiver_account_id = ${account}
            )
            AND r.included_in_block_timestamp BETWEEN ${start} AND ${end}
          ORDER BY
            r.id ASC
          LIMIT
            5000
        ) AS tmp using (receipt_id)
        LEFT JOIN LATERAL (
          SELECT
            b.block_height,
            b.block_timestamp::TEXT
          FROM
            blocks b
          WHERE
            b.block_hash = r.included_in_block_hash
        ) block ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            CASE
              WHEN eo.status = 'SUCCESS_RECEIPT_ID'
              OR eo.status = 'SUCCESS_VALUE' THEN TRUE
              ELSE FALSE
            END AS status
          FROM
            execution_outcomes eo
          WHERE
            eo.receipt_id = r.receipt_id
        ) outcome ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'action',
                ara.action_kind,
                'method',
                ara.args ->> 'method_name'
              )
            ) AS actions
          FROM
            action_receipt_actions ara
          WHERE
            ara.receipt_id = r.receipt_id
        ) actions ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(SUM((ara.args ->> 'deposit')::NUMERIC), 0)::TEXT AS deposit
          FROM
            action_receipt_actions ara
          WHERE
            ara.receipt_id = r.receipt_id
        ) actions_agg ON TRUE
      ORDER BY
        r.id ASC
    `;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Receipt', key: 'receipt' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'From', key: 'from' },
        { header: 'To', key: 'to' },
        { header: 'Block', key: 'block' },
        { header: 'Time', key: 'timestamp' },
      ],
      header: true,
    });

    stringifier.on('error', (error) => {
      next(error);
    });

    stringifier.pipe(res);

    receipts.forEach((receipt) => {
      const status = receipt.outcome.status;
      const action = receipt.actions?.[0]?.action;
      const method = receipt.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: receipt.block.block_height,
        deposit: yoctoToNear(receipt.actions_agg.deposit),
        from: receipt.predecessor_account_id || 'system',
        hash: receipt.originated_from_transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        receipt: receipt.receipt_id,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(receipt.block.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: receipt.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

export default {
  receipts,
  receiptsCount,
  receiptsExport,
};
