import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import db from '#libs/db';
import sql from '#libs/postgres';
import { FtTxns, FtTxnsCount, Holders, Item } from '#libs/schema/fts';
import { getPagination, keyBinder } from '#libs/utils';
import { RawQueryParams, RequestValidator } from '#types/types';

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const contract = req.validator.data.contract;

  const contracts = await sql`
    SELECT
      ft_meta.contract,
      name,
      symbol,
      decimals,
      icon,
      reference,
      price,
      change_24,
      market_cap,
      fully_diluted_market_cap,
      total_supply,
      volume_24h,
      description,
      twitter,
      facebook,
      telegram,
      reddit,
      website,
      coingecko_id,
      coinmarketcap_id,
      livecoinwatch_id,
      (ft_meta.price)::NUMERIC * (ft_meta.total_supply)::NUMERIC AS onchain_market_cap
    FROM
      ft_meta
      LEFT JOIN LATERAL (
        SELECT DISTINCT
          contract
        FROM
          ft_contracts_daily
        WHERE
          contract = ft_meta.contract
      ) list ON TRUE
    WHERE
      ft_meta.contract = ${contract}
  `;

  return res.status(200).json({ contracts });
});

const txns = catchAsync(
  async (req: RequestValidator<FtTxns>, res: Response) => {
    const contract = req.validator.data.contract;
    const account = req.validator.data.a;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);
    // Use the same inner join query for txn count query below
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
            WHERE
              contract_account_id = :contract
              AND ${account ? `affected_account_id = :account` : true}
              AND ${event ? `cause = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  ft_meta ft
                WHERE
                  ft.contract = a.contract_account_id
              )
            ORDER BY
              event_index ${order === 'desc' ? 'DESC' : 'ASC'}
            LIMIT
              :limit OFFSET :offset
          ) AS tmp using(
            event_index
          )
          INNER JOIN LATERAL (
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
          event_index ${order === 'desc' ? 'DESC' : 'ASC'}
      `,
      { account, contract, event, limit, offset },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const account = req.validator.data.a;
    const event = req.validator.data.event;

    const useFormat = true;
    const bindings = { account, contract, event };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        ft_events a
      WHERE
        contract_account_id = :contract
        AND ${account ? `affected_account_id = :account` : true}
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
      rawQuery({
        select: 'contract_account_id',
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
        select: 'COUNT(contract_account_id)',
      }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

const holders = catchAsync(
  async (req: RequestValidator<Holders>, res: Response) => {
    const contract = req.validator.data.contract;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);

    const { query, values } = keyBinder(
      `
        SELECT
          account,
          SUM(amount) AS amount
        FROM
          ft_holders_monthly
        WHERE
          contract = :contract
        GROUP BY
          contract,
          account
        ORDER BY
          SUM(amount) ${order === 'desc' ? 'DESC' : 'ASC'}
        LIMIT
          :limit OFFSET :offset
      `,
      { contract, limit, offset },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ holders: rows });
  },
);

const holdersCount = catchAsync(
  async (req: RequestValidator<Holders>, res: Response) => {
    const contract = req.validator.data.contract;

    const { query, values } = keyBinder(
      `
        SELECT
          COUNT(*)
        FROM (
          SELECT
            account
          FROM
            ft_holders_monthly
          WHERE
            contract = :contract
          GROUP BY
            contract,
            account
        ) s
      `,
      { contract },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ holders: rows });
  },
);

export default { holders, holdersCount, item, txns, txnsCount };
