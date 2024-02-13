import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Count, List, Txns } from '#libs/schema/fts';
import { getPagination, keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const { limit, offset } = getPagination(page, per_page);

  const tokens = await sql`
    SELECT DISTINCT
      ft_contracts_daily.contract,
      (ft_meta.price)::NUMERIC * (ft_meta.total_supply)::NUMERIC AS onchain_market_cap,
      ft_meta.name,
      ft_meta.symbol,
      ft_meta.decimals,
      ft_meta.icon,
      ft_meta.reference,
      ft_meta.price,
      ft_meta.change_24,
      ft_meta.market_cap,
      ft_meta.volume_24h
    FROM
      ft_contracts_daily
      JOIN ft_meta ON ft_meta.contract = ft_contracts_daily.contract
    ORDER BY
      onchain_market_cap DESC NULLS LAST
    LIMIT
      ${limit}
    OFFSET
      ${offset}
  `;

  return res.status(200).json({ tokens });
});

const count = catchAsync(
  async (_req: RequestValidator<Count>, res: Response) => {
    const query = `
      SELECT
        COUNT (DISTINCT contract)
      FROM
        ft_contracts_daily
    `;

    const { rows } = await db.query(query);

    return res.status(200).json({ tokens: rows });
  },
);

const txns = catchAsync(async (req: RequestValidator<Txns>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;

  const { limit, offset } = getPagination(page, per_page);
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
            EXISTS (
              SELECT
                1
              FROM
                ft_meta ft
              WHERE
                ft.contract = a.contract_account_id
            )
          ORDER BY
            event_index DESC
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
    `,
    { limit, offset },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ txns: rows });
});

const txnsCount = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT
        count_estimate(
          '
            SELECT
              contract_account_id
            FROM
              ft_events a
            WHERE
              EXISTS (
                SELECT
                  1
                FROM
                  ft_meta ft
                WHERE
                  ft.contract = a.contract_account_id
              )
          '
        ) as count
    `,
  );

  return res.status(200).json({ txns: rows });
});

export default { count, list, txns, txnsCount };
