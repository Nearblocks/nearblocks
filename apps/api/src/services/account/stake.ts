import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import { StakeTxns, StakeTxnsCount } from '#libs/schema/account';
import { getPagination, keyBinder, msToNsTime } from '#libs/utils';
import { RawQueryParams, RequestValidator } from '#types/types';

const txns = catchAsync(
  async (req: RequestValidator<StakeTxns>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
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
        receipts.receipt_id,
        receipts.predecessor_account_id,
        receipts.receiver_account_id,
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
            AND ${afterTimestamp
        ? sql`t.block_timestamp >= ${afterTimestamp}`
        : true}
            AND ${beforeTimestamp
        ? sql`t.block_timestamp < ${beforeTimestamp}`
        : true}
            AND EXISTS (
              SELECT
                1
              FROM
                action_receipt_actions a
              WHERE
                a.receipt_id = r.receipt_id
                AND a.args ->> 'method_name' IN (
                  'deposit_and_stake',
                  'stake',
                  'stake_all',
                  'unstake',
                  'unstake_all'
                )
            )
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
                    'fee',
                    COALESCE(execution_outcomes.tokens_burnt, 0)
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
        tr.block_timestamp ${order === 'desc' ? sql`DESC` : sql`ASC`},
        tr.index_in_chunk ${order === 'desc' ? sql`DESC` : sql`ASC`}
    `;

    return res.status(200).json({ txns });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<StakeTxnsCount>, res: Response) => {
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
    const bindings = {
      account,
      afterDate,
      beforeDate,
      from,
      to,
    };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        receipts r
        JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
      WHERE
        ${
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
        AND EXISTS (
          SELECT
            1
          FROM
            action_receipt_actions a
          WHERE
            a.receipt_id = r.receipt_id
            AND a.args ->> '${options.method}' IN (
              '${options.methods?.[0]}',
              '${options.methods?.[1]}',
              '${options.methods?.[2]}',
              '${options.methods?.[3]}',
              '${options.methods?.[4]}'
            )
        )
    `;

    const { query, values } = keyBinder(
      rawQuery({
        method: `'method_name'`,
        methods: [
          `'deposit_and_stake'`,
          `'stake'`,
          `'stake_all'`,
          `'unstake'`,
          `'unstake_all'`,
        ],
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
        method: 'method_name',
        methods: [
          'deposit_and_stake',
          'stake',
          'stake_all',
          'unstake',
          'unstake_all',
        ],
        select: 'COUNT(r.receipt_id)',
      }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

export default { txns, txnsCount };
