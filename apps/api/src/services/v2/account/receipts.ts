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
        receipts.id,
        receipts.receipt_id,
        receipts.originated_from_transaction_hash AS transaction_hash,
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
        ROW_TO_JSON(block) AS block,
        ROW_TO_JSON(outcome) AS outcome,
        actions.actions AS actions,
        ROW_TO_JSON(actions_agg) AS actions_agg
      FROM
        receipts
        INNER JOIN (${from || to ? intersect : union}) AS tmp using (receipt_id)
        LEFT JOIN LATERAL (
          SELECT
            block_hash,
            block_height,
            block_timestamp::TEXT
          FROM
            blocks
          WHERE
            block_hash = receipts.included_in_block_hash
        ) block ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            gas_burnt::TEXT,
            tokens_burnt::TEXT,
            executor_account_id,
            CASE
              WHEN status = 'SUCCESS_RECEIPT_ID'
              OR status = 'SUCCESS_VALUE' THEN TRUE
              ELSE FALSE
            END AS status
          FROM
            execution_outcomes
          WHERE
            receipt_id = receipts.receipt_id
        ) outcome ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'action',
                action_receipt_actions.action_kind,
                'method',
                action_receipt_actions.args ->> 'method_name',
                'deposit',
                COALESCE(
                  (action_receipt_actions.args ->> 'deposit')::NUMERIC,
                  0
                )::TEXT,
                'fee',
                COALESCE(execution_outcomes.tokens_burnt, 0)::TEXT,
                'args',
                action_receipt_actions.args ->> 'args_json'
              )
            ) AS actions
          FROM
            action_receipt_actions
            JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          WHERE
            action_receipt_actions.receipt_id = receipts.receipt_id
        ) actions ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)::TEXT AS deposit
          FROM
            action_receipt_actions
          WHERE
            action_receipt_actions.receipt_id = receipts.receipt_id
        ) actions_agg ON TRUE
      ORDER BY
        receipts.id ${sort}
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
        receipts.receipt_id,
        receipts.originated_from_transaction_hash,
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
        ROW_TO_JSON(block) AS block,
        ROW_TO_JSON(outcome) AS outcome,
        actions.actions AS actions,
        ROW_TO_JSON(actions_agg) AS actions_agg
      FROM
        receipts
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
            block_height,
            block_timestamp::TEXT
          FROM
            blocks
          WHERE
            block_hash = receipts.included_in_block_hash
        ) block ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            CASE
              WHEN status = 'SUCCESS_RECEIPT_ID'
              OR status = 'SUCCESS_VALUE' THEN TRUE
              ELSE FALSE
            END AS status
          FROM
            execution_outcomes
          WHERE
            receipt_id = receipts.receipt_id
        ) outcome ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'action',
                action_receipt_actions.action_kind,
                'method',
                action_receipt_actions.args ->> 'method_name'
              )
            ) AS actions
          FROM
            action_receipt_actions
            JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          WHERE
            action_receipt_actions.receipt_id = receipts.receipt_id
        ) actions ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)::TEXT AS deposit
          FROM
            action_receipt_actions
          WHERE
            action_receipt_actions.receipt_id = receipts.receipt_id
        ) actions_agg ON TRUE
      ORDER BY
        receipts.id ASC
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
