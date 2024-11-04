import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import {
  MultiChainAccounts,
  MultiChainTxns,
  MultiChainTxnsCount,
} from '#libs/schema/chain-abstraction';
import { getPagination, keyBinder, msToNsTime } from '#libs/utils';
import { RequestValidator } from '#types/types';

const multiChainAccounts = catchAsync(
  async (req: RequestValidator<MultiChainAccounts>, res: Response) => {
    const account = req.validator.data.account;

    const multiChainAccounts = await sql`
      SELECT
        account_id,
        derived_address,
        public_key,
        chain,
        path,
        block_height,
        block_timestamp
      FROM
        multichain_accounts
      WHERE
        account_id = ${account}
    `;

    return res.status(200).json({ multiChainAccounts });
  },
);

const multiChainTxns = catchAsync(
  async (req: RequestValidator<MultiChainTxns>, res: Response) => {
    const account = req.validator.data.account;
    const afterBlock = req.validator.data.after_block;
    const beforeBlock = req.validator.data.before_block;
    const from = req.validator.data.from;
    const afterDate = req.validator.data.after_date;
    const beforeDate = req.validator.data.before_date;
    const cursor = req.validator.data.cursor;
    const order = req.validator.data.order;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const chainId = req.validator.data.chain?.toUpperCase();
    const derivedAddress = req.validator.data.multichain_address?.toLowerCase();

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

    const { limit, offset } = getPagination(page, per_page);

    const multiChainTxnsQuery = await sql`
      SELECT
        mtx.id,
        mtx.receipt_id,
        mtx.account_id,
        mtx.derived_address,
        mtx.public_key,
        mtx.chain,
        mtx.path,
        mtx.derived_transaction,
        mtx.block_height,
        mtx.block_timestamp,
        r.transaction_hash,
        oc.status
      FROM
        multichain_transactions AS mtx
        INNER JOIN (
          SELECT
            id
          FROM
            multichain_transactions
          WHERE
            ${account ? sql`account_id = ${account}` : true}
            AND ${from ? sql`account_id = ${from}` : true}
            AND ${derivedAddress
        ? sql`derived_address = ${derivedAddress}`
        : true}
            AND ${chainId ? sql`chain = ${chainId}` : true}
            AND ${cursor
        ? sql`id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
        : true}
            AND ${afterTimestamp
        ? sql`block_timestamp >= ${afterTimestamp}`
        : true}
            AND ${beforeTimestamp
        ? sql`block_timestamp < ${beforeTimestamp}`
        : true}
            AND ${afterBlock ? sql`block_height > ${afterBlock}` : true}
            AND ${beforeBlock ? sql`block_height < ${beforeBlock}` : true}
        ) AS filtered_mtx USING (id)
        LEFT JOIN LATERAL (
          SELECT
            originated_from_transaction_hash AS transaction_hash
          FROM
            receipts
          WHERE
            receipts.receipt_id = mtx.receipt_id
        ) r ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            gas_burnt,
            tokens_burnt,
            executor_account_id,
            CASE
              WHEN status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE') THEN TRUE
              ELSE FALSE
            END AS status
          FROM
            execution_outcomes
          WHERE
            execution_outcomes.receipt_id = mtx.receipt_id
        ) oc ON TRUE
      ORDER BY
        mtx.id ${order === 'desc' ? sql`DESC` : sql`ASC`}
      LIMIT
        ${limit}
      OFFSET
        ${cursor ? 0 : offset};
    `;

    let nextCursor = multiChainTxnsQuery?.[multiChainTxnsQuery?.length - 1]?.id;
    nextCursor =
      multiChainTxnsQuery?.length === per_page && nextCursor
        ? nextCursor
        : undefined;

    return res
      .status(200)
      .json({ cursor: nextCursor, txns: multiChainTxnsQuery });
  },
);

const multiChainTxnsCount = catchAsync(
  async (req: RequestValidator<MultiChainTxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const afterDate = req.validator.data.after_date;
    const beforeDate = req.validator.data.before_date;
    const chain = req.validator.data.chain;
    const derivedAddress = req.validator.data.multichain_address?.toLowerCase();

    let afterTimestamp: null | string = null;
    let beforeTimestamp: null | string = null;

    if (afterDate) {
      afterTimestamp = msToNsTime(
        dayjs(afterDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
      );
    }
    if (beforeDate) {
      beforeTimestamp = msToNsTime(
        dayjs(beforeDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
      );
    }

    const bindings = {
      account,
      afterTimestamp,
      beforeTimestamp,
      chain,
      derivedAddress,
      from,
    };

    const useFormat = true;

    const rawQuery = (options: { select: string }) => `
       SELECT
        ${options.select}
      FROM
        multichain_transactions mt
      WHERE
        ${account ? `mt.account_id = :account` : '1=1'}
        AND ${from ? `mt.account_id = :from` : '1=1'}
        AND ${chain ? `mt.chain = :chain` : '1=1'}
        AND ${derivedAddress ? `mt.derived_address = :derivedAddress` : '1=1'}
        AND ${afterTimestamp ? `mt.block_timestamp >= :afterTimestamp` : '1=1'}
        AND ${
          beforeTimestamp ? `mt.block_timestamp <= :beforeTimestamp` : '1=1'
        }
    `;

    const { query, values } = keyBinder(
      rawQuery({ select: 'mt.id' }),
      bindings,
      useFormat,
    );

    const { rows: costRows } = await db.query(
      `SELECT cost, rows as count FROM count_cost_estimate(${query})`,
      values,
    );

    const cost = +costRows?.[0]?.cost;
    const count = +costRows?.[0]?.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return res.status(200).json({ txns: costRows });
    }

    const { query: countQuery, values: countValues } = keyBinder(
      rawQuery({ select: 'COUNT(mt.id)' }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

export default { multiChainAccounts, multiChainTxns, multiChainTxnsCount };
