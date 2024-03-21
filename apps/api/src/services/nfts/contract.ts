import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Holders, Item, NftTxns, NftTxnsCount } from '#libs/schema/nfts';
import { getPagination, keyBinder } from '#libs/utils';
import { RawQueryParams, RequestValidator } from '#types/types';

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const contract = req.validator.data.contract;

  const { query, values } = keyBinder(
    `
      SELECT
        contract,
        name,
        symbol,
        icon,
        base_uri,
        reference,
        description,
        twitter,
        facebook,
        telegram,
        reddit,
        website,
        tokens.count AS tokens
      FROM
        nft_meta
        LEFT JOIN LATERAL (
          SELECT
            COUNT(contract)
          FROM
            nft_token_meta
          WHERE
            contract = nft_meta.contract
        ) tokens ON TRUE
      WHERE
        contract = :contract
    `,
    { contract },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ contracts: rows });
});

const txns = catchAsync(
  async (req: RequestValidator<NftTxns>, res: Response) => {
    const contract = req.validator.data.contract;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

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
              contract_account_id = :contract
              AND ${event ? `cause = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.contract_account_id
              )
              AND EXISTS (
                SELECT
                  1
                FROM
                  transactions
                  JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
                WHERE
                  receipts.receipt_id = a.receipt_id
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
              receipts.receipt_id = nft_events.receipt_id
          ) txn ON TRUE
        ORDER BY
          event_index ${order === 'desc' ? 'DESC' : 'ASC'}
      `,
      { contract, event, limit, offset },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const event = req.validator.data.event;

    const useFormat = true;
    const bindings = { contract, event };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        nft_events a
      WHERE
        contract_account_id = :contract
        AND ${event ? `cause = :event` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            nft_meta nft
          WHERE
            nft.contract = a.contract_account_id
        )
        AND EXISTS (
          SELECT
            1
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = a.receipt_id
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

    const holders = await sql`
      SELECT
        account,
        COUNT(token) AS quantity
      FROM
        nft_holders
      WHERE
        contract = ${contract}
        AND quantity > 0
      GROUP BY
        account
      ORDER BY
        COUNT(token) ${order === 'desc' ? sql`DESC` : sql`ASC`}
      LIMIT
        ${limit}
      OFFSET
        ${offset}
    `;

    return res.status(200).json({ holders });
  },
);

const holdersCount = catchAsync(
  async (req: RequestValidator<Holders>, res: Response) => {
    const contract = req.validator.data.contract;

    const holders = await sql`
      SELECT
        COUNT(DISTINCT account)
      FROM
        nft_holders
      WHERE
        contract = ${contract}
        AND quantity > 0
    `;

    return res.status(200).json({ holders });
  },
);

export default { holders, holdersCount, item, txns, txnsCount };
