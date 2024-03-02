import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Count, List, Txns } from '#libs/schema/nfts';
import { getPagination, keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const search = req.validator.data.search;
  const order = req.validator.data.order;
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const { limit, offset } = getPagination(page, per_page);

  const tokens = await sql`
    SELECT DISTINCT
      nft_contracts_daily.contract,
      nft_meta.name,
      nft_meta.symbol,
      nft_meta.icon,
      nft_meta.base_uri,
      nft_meta.reference,
      tokens.count AS tokens,
      day.count AS transfers_day,
      holders.count AS holders
    FROM
      nft_contracts_daily
      JOIN nft_meta ON nft_meta.contract = nft_contracts_daily.contract
      LEFT JOIN LATERAL (
        SELECT
          COUNT(contract)
        FROM
          nft_token_meta
        WHERE
          contract = nft_contracts_daily.contract
      ) tokens ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(contract_account_id)
        FROM
          nft_events
        WHERE
          block_timestamp > CAST(
            EXTRACT(
              epoch
              FROM
                NOW() - '1 day'::INTERVAL
            ) AS BIGINT
          ) * 1000 * 1000 * 1000
          AND contract_account_id = nft_contracts_daily.contract
      ) day ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)
        FROM
          (
            SELECT
              account
            FROM
              nft_holders_daily
            WHERE
              contract = nft_contracts_daily.contract
            GROUP BY
              contract,
              account
          ) s
      ) holders ON TRUE
    WHERE
      ${search
      ? sql`
          nft_meta.contract ILIKE ${search + '%'}
          OR nft_meta.symbol ILIKE ${search + '%'}
          OR nft_meta.name ILIKE ${search + '%'}
        `
      : true}
    ORDER BY
      transfers_day ${order === 'desc' ? sql`DESC NULLS LAST` : sql`ASC`}
    LIMIT
      ${limit}
    OFFSET
      ${offset}
  `;

  return res.status(200).json({ tokens });
});

const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const search = req.validator.data.search;

    const tokens = await sql`
      SELECT
        COUNT(DISTINCT nft_contracts_daily.contract)
      FROM
        nft_contracts_daily
        JOIN nft_meta ON nft_meta.contract = nft_contracts_daily.contract
      WHERE
        ${search
        ? sql`
            nft_meta.contract ILIKE ${search + '%'}
            OR nft_meta.symbol ILIKE ${search + '%'}
            OR nft_meta.name ILIKE ${search + '%'}
          `
        : true}
    `;

    return res.status(200).json({ tokens });
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
        token_id,
        cause,
        delta_amount,
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
              'icon',
              icon,
              'base_uri',
              base_uri,
              'reference',
              reference
            )
          FROM
            nft_meta
          WHERE
            nft_meta.contract = contract_account_id
        ) AS nft
      FROM
        nft_events
        INNER JOIN (
          SELECT
            event_index
          FROM
            nft_events a
          WHERE
            EXISTS (
              SELECT
                1
              FROM
                nft_token_meta nft
              WHERE
                nft.contract = a.contract_account_id
                AND nft.token = a.token_id
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
            receipts.receipt_id = nft_events.receipt_id
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
              event_index
            FROM
              nft_events a
            WHERE
              EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.contract_account_id
              )
          '
        ) as count
    `,
  );

  return res.status(200).json({ txns: rows });
});

export default { count, list, txns, txnsCount };
