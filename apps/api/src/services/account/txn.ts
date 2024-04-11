import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Txns, TxnsCount, TxnsExport } from '#libs/schema/account';
import { streamCsv } from '#libs/stream';
import {
  getPagination,
  keyBinder,
  msToNsTime,
  nsToMsTime,
  yoctoToNear,
} from '#libs/utils';
import { ActionKind } from '#types/enums';
import {
  RawQueryParams,
  RequestValidator,
  StreamTransformWrapper,
} from '#types/types';

const txns = catchAsync(async (req: RequestValidator<Txns>, res: Response) => {
  const account = req.validator.data.account;
  const from = req.validator.data.from;
  const to = req.validator.data.to;
  const action = req.validator.data.action;
  const method = req.validator.data.method;
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const order = req.validator.data.order;

  if (from && to && from !== account && to !== account) {
    return res.status(200).json({ txns: [] });
  }

  const { limit, offset } = getPagination(page, per_page);
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
          ${from || to
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
          t.block_timestamp ${order === 'desc' ? sql`DESC` : sql`ASC`},
          t.index_in_chunk ${order === 'desc' ? sql`DESC` : sql`ASC`}
        LIMIT
          ${limit}
        OFFSET
          ${offset}
      ) AS tmp using (receipt_id)
      INNER JOIN LATERAL (
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
      tr.block_timestamp ${order === 'desc' ? sql`DESC` : sql`ASC`},
      tr.index_in_chunk ${order === 'desc' ? sql`DESC` : sql`ASC`}
  `;

  return res.status(200).json({ txns });
});

const txnsCount = catchAsync(
  async (req: RequestValidator<TxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const useFormat = true;
    const bindings = { account, action, from, method, to };
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
  async (req: RequestValidator<TxnsExport>, res: Response) => {
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
                r.predecessor_account_id = :account
                OR r.receiver_account_id = :account
              )
              AND t.block_timestamp BETWEEN :start AND :end
            ORDER BY
              t.block_timestamp ASC,
              t.index_in_chunk ASC
            LIMIT
              5000
          ) AS tmp using(receipt_id)
          LEFT JOIN LATERAL (
            SELECT
              transaction_hash,
              included_in_block_hash,
              block_timestamp,
              index_in_chunk,
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
                  json_agg(
                    json_build_object(
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
                  json_build_object(
                    'deposit',
                    COALESCE(SUM((args ->> 'deposit') :: NUMERIC), 0)
                  )
                FROM
                  action_receipt_actions
                  JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
                WHERE
                  receipts.receipt_id = transactions.converted_into_receipt_id
              ) AS actions_agg,
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
              ) AS outcomes,
              (
                SELECT
                  json_build_object(
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
      `,
      { account, end, start },
    );

    const columns = [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'Deposit Value', key: 'deposit' },
      { header: 'Txn Fee', key: 'fee' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ];
    const transform: StreamTransformWrapper =
      (stringifier) => (row, _, callback) => {
        const status = row.outcomes.status;
        const action = row.actions?.[0]?.action;
        const method = row.actions?.[0]?.method ?? 'Unknown';

        stringifier.write({
          block: row.block.block_height,
          deposit: yoctoToNear(row.actions_agg.deposit),
          fee: yoctoToNear(row.outcomes_agg.transaction_fee),
          from: row.predecessor_account_id || 'system',
          hash: row.transaction_hash,
          method:
            !action || action === ActionKind.FUNCTION_CALL ? method : action,
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          timestamp: dayjs(+nsToMsTime(row.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          to: row.receiver_account_id || 'system',
        });
        callback();
      };

    streamCsv(res, query, values, columns, transform);
  },
);

export default { txns, txnsCount, txnsExport };
