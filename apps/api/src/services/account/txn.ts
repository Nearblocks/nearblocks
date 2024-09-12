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
  Txns,
  TxnsCount,
  TxnsExport,
  TxnsOnly,
  TxnsOnlyCount,
  TxnsOnlyExport,
} from '#libs/schema/account';
import {
  getPagination,
  keyBinder,
  msToNsTime,
  nsToMsTime,
  yoctoToNear,
} from '#libs/utils';
import { ActionKind } from '#types/enums';
import { RawQueryParams, RequestValidator } from '#types/types';

const txns = catchAsync(async (req: RequestValidator<Txns>, res: Response) => {
  const account = req.validator.data.account;
  const from = req.validator.data.from;
  const to = req.validator.data.to;
  const action = req.validator.data.action;
  const method = req.validator.data.method;
  const cursor = req.validator.data.cursor;
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

  if (from && to && from !== account && to !== account) {
    return res.status(200).json({ txns: [] });
  }

  const { limit, offset } = getPagination(page, per_page);
  const txns = await sql`
    SELECT
      receipts.id,
      receipts.receipt_id,
      receipts.predecessor_account_id,
      receipts.receiver_account_id,
      receipts.receipt_kind,
      ROW_TO_JSON(bl) AS receipt_block,
      ROW_TO_JSON(oc) AS receipt_outcome,
      tr.transaction_hash,
      tr.included_in_block_hash,
      tr.block_timestamp,
      tr.block,
      tr.receipt_conversion_tokens_burnt,
      tr.actions,
      tr.actions_agg,
      tr.outcomes,
      tr.outcomes_agg
    FROM
      receipts
      INNER JOIN (
        SELECT
          r.receipt_id
        FROM
          receipts r
          JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
        WHERE
          r.receipt_kind = 'ACTION'
          AND ${from || to
      ? sql`
          r.predecessor_account_id = ${from ?? account}
          AND r.receiver_account_id = ${to ?? account}
        `
      : sql`
          (
            r.predecessor_account_id = ${account}
            OR r.receiver_account_id = ${account}
          )
        `}
          AND ${cursor
      ? sql`r.id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
      : true}
          AND ${afterTimestamp
      ? sql`t.block_timestamp >= ${afterTimestamp}`
      : true}
          AND ${beforeTimestamp
      ? sql`t.block_timestamp < ${beforeTimestamp}`
      : true}
          AND ${action || method
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
      : true}
        ORDER BY
          t.id ${order === 'desc' ? sql`DESC` : sql`ASC`},
          r.id ${order === 'desc' ? sql`DESC` : sql`ASC`}
        LIMIT
          ${limit}
        OFFSET
          ${cursor ? 0 : offset}
      ) AS tmp using (receipt_id)
      LEFT JOIN LATERAL (
        SELECT
          block_hash,
          block_height,
          block_timestamp
        FROM
          blocks
        WHERE
          block_hash = receipts.included_in_block_hash
      ) bl ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          gas_burnt,
          tokens_burnt,
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
      ) oc ON TRUE
      INNER JOIN LATERAL (
        SELECT
          id,
          transaction_hash,
          included_in_block_hash,
          block_timestamp,
          index_in_chunk,
          receipt_conversion_tokens_burnt,
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
                  ),
                  'fee',
                  COALESCE(execution_outcomes.tokens_burnt, 0),
                  'args',
                  action_receipt_actions.args ->> 'args_json'
                )
              )
            FROM
              action_receipt_actions
              JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
            WHERE
              action_receipt_actions.receipt_id = receipts.receipt_id
          ) AS actions,
          (
            SELECT
              JSON_BUILD_OBJECT(
                'deposit',
                COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
              )
            FROM
              action_receipt_actions
              JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
            WHERE
              receipts.receipt_id = transactions.converted_into_receipt_id
          ) AS actions_agg,
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
        WHERE
          transactions.transaction_hash = receipts.originated_from_transaction_hash
      ) tr ON TRUE
    ORDER BY
      tr.id ${order === 'desc' ? sql`DESC` : sql`ASC`}
  `;

  let nextCursor = txns?.[txns?.length - 1]?.id;
  nextCursor = txns?.length === per_page && nextCursor ? nextCursor : undefined;

  return res.status(200).json({ cursor: nextCursor, txns });
});

const txnsCount = catchAsync(
  async (req: RequestValidator<TxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;
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

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const useFormat = true;
    const bindings = {
      account,
      action,
      afterDate,
      beforeDate,
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
        AND ${afterTimestamp ? `t.block_timestamp >= :afterTimestamp` : true}
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

const txnsExport = catchAsync(
  async (
    req: RequestValidator<TxnsExport>,
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
        receipts.receipt_id,
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
        tr.transaction_hash,
        tr.included_in_block_hash,
        tr.block_timestamp,
        tr.block,
        tr.actions,
        tr.actions_agg,
        tr.outcomes,
        tr.outcomes_agg
      FROM
        receipts
        INNER JOIN (
          SELECT
            r.receipt_id
          FROM
            receipts r
            JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
          WHERE
            r.receipt_kind = 'ACTION'
            AND (
              r.predecessor_account_id = ${account}
              OR r.receiver_account_id = ${account}
            )
            AND t.block_timestamp BETWEEN ${start} AND ${end}
          ORDER BY
            t.block_timestamp ASC,
            t.index_in_chunk ASC
          LIMIT
            5000
        ) AS tmp using (receipt_id)
        LEFT JOIN LATERAL (
          SELECT
            transaction_hash,
            included_in_block_hash,
            block_timestamp,
            index_in_chunk,
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
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'action',
                    action_receipt_actions.action_kind,
                    'method',
                    action_receipt_actions.args ->> 'method_name'
                  )
                )
              FROM
                action_receipt_actions
              WHERE
                action_receipt_actions.receipt_id = receipts.receipt_id
            ) AS actions,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'deposit',
                  COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
                )
              FROM
                action_receipt_actions
                JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
              WHERE
                receipts.receipt_id = transactions.converted_into_receipt_id
            ) AS actions_agg,
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
          WHERE
            transactions.transaction_hash = receipts.originated_from_transaction_hash
        ) tr ON TRUE
      ORDER BY
        tr.block_timestamp ASC,
        tr.index_in_chunk ASC
    `;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'Txn Fee', key: 'fee' },
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

    txns.forEach((txn) => {
      const status = txn.outcomes.status;
      const action = txn.actions?.[0]?.action;
      const method = txn.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: txn.block.block_height,
        deposit: yoctoToNear(txn.actions_agg.deposit),
        fee: yoctoToNear(txn.outcomes_agg.transaction_fee),
        from: txn.predecessor_account_id || 'system',
        hash: txn.transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(txn.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: txn.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

const txnsOnly = catchAsync(
  async (req: RequestValidator<TxnsOnly>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const cursor = req.validator.data.cursor;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;
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

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const cursors = cursor
      ? sql`t.id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
      : true;
    const after = afterTimestamp
      ? sql`t.block_timestamp >= ${afterTimestamp}`
      : true;
    const before = beforeTimestamp
      ? sql`t.block_timestamp < ${beforeTimestamp}`
      : true;
    const sort = order === 'desc' ? sql`DESC` : sql`ASC`;
    const union = sql`
      SELECT
        transaction_hash
      FROM
        (
          (
            SELECT
              t.id,
              t.transaction_hash
            FROM
              transactions t
            WHERE
              t.signer_account_id = ${account}
              AND ${cursors}
              AND ${after}
              AND ${before}
            ORDER BY
              t.id ${sort}
            LIMIT
              ${per_page}
          )
          UNION
          (
            SELECT
              t.id,
              t.transaction_hash
            FROM
              transactions t
            WHERE
              t.receiver_account_id = ${account}
              AND ${cursors}
              AND ${after}
              AND ${before}
            ORDER BY
              t.id ${sort}
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
        t.transaction_hash
      FROM
        transactions t
      WHERE
        t.signer_account_id = ${from || account}
        AND t.receiver_account_id = ${to || account}
        AND ${cursors}
        AND ${after}
        AND ${before}
      ORDER BY
        t.id ${sort}
      LIMIT
        ${per_page}
    `;

    const txns = await sql`
      SELECT
        id,
        signer_account_id,
        receiver_account_id,
        transaction_hash,
        included_in_block_hash,
        block_timestamp,
        receipt_conversion_tokens_burnt,
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
                ),
                'fee',
                COALESCE(execution_outcomes.tokens_burnt, 0),
                'args',
                action_receipt_actions.args ->> 'args_json'
              )
            )
          FROM
            action_receipt_actions
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
            JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.receipt_id = transactions.converted_into_receipt_id
        ) AS actions,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'deposit',
              COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
            )
          FROM
            action_receipt_actions
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.receipt_id = transactions.converted_into_receipt_id
        ) AS actions_agg,
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
        INNER JOIN (${from || to
        ? intersect
        : union}) AS tmp using (transaction_hash)
      ORDER BY
        id ${sort}
    `;

    let nextCursor = txns?.[txns?.length - 1]?.id;
    nextCursor =
      txns?.length === per_page && nextCursor ? nextCursor : undefined;

    return res.status(200).json({ cursor: nextCursor, txns });
  },
);

const txnsOnlyCount = catchAsync(
  async (req: RequestValidator<TxnsOnlyCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
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

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const useFormat = true;
    const bindings = { account, afterTimestamp, beforeTimestamp, from, to };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        transactions t
      WHERE
      ${
        from || to
          ? `
            t.signer_account_id = ${from ? `:from` : `:account`}
            AND t.receiver_account_id = ${to ? `:to` : `:account`}
          `
          : `
            (
              t.signer_account_id = :account
              OR t.receiver_account_id = :account
            )
          `
      }
      AND ${afterTimestamp ? `t.block_timestamp >= :afterTimestamp` : true}
      AND ${beforeTimestamp ? `t.block_timestamp < :beforeTimestamp` : true}
    `;

    const { query, values } = keyBinder(
      rawQuery({ select: 't.transaction_hash' }),
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
      rawQuery({ select: 'COUNT(t.transaction_hash)' }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

const txnsOnlyExport = catchAsync(
  async (
    req: RequestValidator<TxnsOnlyExport>,
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
        id,
        signer_account_id,
        receiver_account_id,
        transaction_hash,
        included_in_block_hash,
        block_timestamp,
        receipt_conversion_tokens_burnt,
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
                ),
                'fee',
                COALESCE(execution_outcomes.tokens_burnt, 0),
                'args',
                action_receipt_actions.args ->> 'args_json'
              )
            )
          FROM
            action_receipt_actions
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
            JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.originated_from_transaction_hash = transactions.transaction_hash
        ) AS actions,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'deposit',
              COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
            )
          FROM
            action_receipt_actions
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.receipt_id = transactions.converted_into_receipt_id
        ) AS actions_agg,
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
        INNER JOIN (
          SELECT
            t.transaction_hash
          FROM
            transactions t
          WHERE
            (
              t.signer_account_id = ${account}
              OR t.receiver_account_id = ${account}
            )
            AND t.block_timestamp BETWEEN ${start} AND ${end}
          ORDER BY
            t.id ASC
          LIMIT
            5000
        ) AS tmp using (transaction_hash)
      ORDER BY
        id ASC
    `;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'Txn Fee', key: 'fee' },
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

    txns.forEach((txn) => {
      const status = txn.outcomes.status;
      const action = txn.actions?.[0]?.action;
      const method = txn.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: txn.block.block_height,
        deposit: yoctoToNear(txn.actions_agg.deposit),
        fee: yoctoToNear(txn.outcomes_agg.transaction_fee),
        from: txn.signer_account_id || 'system',
        hash: txn.transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(txn.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: txn.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

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

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const cursors = cursor
      ? sql`r.id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
      : true;
    const after = afterTimestamp
      ? sql`r.included_in_block_timestamp >= ${afterTimestamp}`
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
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
        ROW_TO_JSON(bl) AS receipt_block,
        ROW_TO_JSON(oc) AS receipt_outcome,
        tr.transaction_hash,
        tr.included_in_block_hash,
        tr.block_timestamp,
        tr.block,
        tr.receipt_conversion_tokens_burnt,
        tr.actions,
        tr.actions_agg,
        tr.outcomes,
        tr.outcomes_agg
      FROM
        receipts
        INNER JOIN (${from || to ? intersect : union}) AS tmp using (receipt_id)
        LEFT JOIN LATERAL (
          SELECT
            block_hash,
            block_height,
            block_timestamp
          FROM
            blocks
          WHERE
            block_hash = receipts.included_in_block_hash
        ) bl ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            gas_burnt,
            tokens_burnt,
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
        ) oc ON TRUE
        INNER JOIN LATERAL (
          SELECT
            id,
            transaction_hash,
            included_in_block_hash,
            block_timestamp,
            index_in_chunk,
            receipt_conversion_tokens_burnt,
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
                    ),
                    'fee',
                    COALESCE(execution_outcomes.tokens_burnt, 0),
                    'args',
                    action_receipt_actions.args ->> 'args_json'
                  )
                )
              FROM
                action_receipt_actions
                JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
              WHERE
                action_receipt_actions.receipt_id = receipts.receipt_id
            ) AS actions,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'deposit',
                  COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
                )
              FROM
                action_receipt_actions
                JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
              WHERE
                receipts.receipt_id = transactions.converted_into_receipt_id
            ) AS actions_agg,
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
          WHERE
            transactions.transaction_hash = receipts.originated_from_transaction_hash
        ) tr ON TRUE
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
        AND ${afterTimestamp ? `t.block_timestamp >= :afterTimestamp` : true}
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

    const txns = await sql`
      SELECT
        receipts.receipt_id,
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
        tr.transaction_hash,
        tr.included_in_block_hash,
        tr.block_timestamp,
        tr.block,
        tr.actions,
        tr.actions_agg,
        tr.outcomes,
        tr.outcomes_agg
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
            transaction_hash,
            included_in_block_hash,
            block_timestamp,
            index_in_chunk,
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
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'action',
                    action_receipt_actions.action_kind,
                    'method',
                    action_receipt_actions.args ->> 'method_name'
                  )
                )
              FROM
                action_receipt_actions
              WHERE
                action_receipt_actions.receipt_id = receipts.receipt_id
            ) AS actions,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'deposit',
                  COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
                )
              FROM
                action_receipt_actions
                JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
              WHERE
                receipts.receipt_id = transactions.converted_into_receipt_id
            ) AS actions_agg,
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
          WHERE
            transactions.transaction_hash = receipts.originated_from_transaction_hash
        ) tr ON TRUE
      ORDER BY
        tr.block_timestamp ASC,
        tr.index_in_chunk ASC
    `;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'Txn Fee', key: 'fee' },
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

    txns.forEach((txn) => {
      const status = txn.outcomes.status;
      const action = txn.actions?.[0]?.action;
      const method = txn.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: txn.block.block_height,
        deposit: yoctoToNear(txn.actions_agg.deposit),
        fee: yoctoToNear(txn.outcomes_agg.transaction_fee),
        from: txn.predecessor_account_id || 'system',
        hash: txn.transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(txn.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: txn.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

export default {
  receipts,
  receiptsCount,
  receiptsExport,
  txns,
  txnsCount,
  txnsExport,
  txnsOnly,
  txnsOnlyCount,
  txnsOnlyExport,
};
