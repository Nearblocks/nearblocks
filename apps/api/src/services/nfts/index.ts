import { Request, Response } from 'express';

import db from '#libs/db';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { List, Count, Txns } from '#libs/schema/nfts';
import { keyBinder, getPagination } from '#libs/utils';

const orderBy = (sort: string) => {
  switch (sort) {
    case 'name':
      return 'lower(nft_list.name)';
    case 'tokens':
      return 'tokens';
    case 'txns_3days':
      return 'transfers_3days';
    case 'txns':
      return 'transfers';
    case 'holders':
      return 'holders';
    default:
      return 'transfers_day';
  }
};

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const search = req.validator.data.search;
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const sort = req.validator.data.sort;
  const order = req.validator.data.order;

  const { limit, offset } = getPagination(page, per_page);
  // Use the same inner join query for count query below
  const { query, values } = keyBinder(
    `
      SELECT
        contract,
        nft_meta.name,
        nft_meta.symbol,
        nft_meta.icon,
        nft_meta.base_uri,
        nft_meta.reference,
        tokens,
        transfers_day,
        transfers_3days,
        transfers,
        holders
      FROM
        nft_list
        INNER JOIN (
          SELECT
            contract
          FROM
            nft_list
          WHERE
            ${
              search
                ? `
                  contract ILIKE :search
                  OR symbol ILIKE :search
                  OR name ILIKE :search
                `
                : true
            }
          ORDER BY
            ${orderBy(sort)} ${order === 'desc' ? 'DESC NULLS LAST' : 'ASC'}
          LIMIT
            :limit OFFSET :offset
        ) AS tmp using(
          contract
        )
        LEFT JOIN LATERAL (
          SELECT
            name,
            symbol,
            icon,
            base_uri,
            reference
          FROM
            nft_meta
          WHERE
            nft_meta.contract = nft_list.contract
        ) nft_meta ON true
      ORDER BY
        ${orderBy(sort)} ${order === 'desc' ? 'DESC NULLS LAST' : 'ASC'}
    `,
    { search: `%${search}%`, limit, offset },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ tokens: rows });
});

const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const search = req.validator.data.search;

    // Use the same query from the txn inner join here
    const { query, values } = keyBinder(
      `
        SELECT
          COUNT (contract)
        FROM
          nft_list
        WHERE
          ${
            search
              ? `
                contract ILIKE :search
                OR symbol ILIKE :search
                OR name ILIKE :search
              `
              : true
          }
      `,
      { search: `%${search}%` },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ tokens: rows });
  },
);

const txns = catchAsync(async (req: RequestValidator<Txns>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;

  const { limit, offset } = getPagination(page, per_page);
  // Use the same inner join query for count query below
  const { query, values } = keyBinder(
    `
      SELECT
        concat_ws(
          '-',
          emitted_for_receipt_id,
          emitted_at_block_timestamp,
          emitted_in_shard_id,
          emitted_for_event_type,
          emitted_index_of_event_entry_in_shard
        ) as key,
        token_old_owner_account_id,
        token_new_owner_account_id,
        token_id,
        event_kind,
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
            nft_meta.contract = emitted_by_contract_account_id
        ) AS nft
      FROM
        assets__non_fungible_token_events
        INNER JOIN (
          SELECT
            emitted_for_receipt_id,
            emitted_at_block_timestamp,
            emitted_in_shard_id,
            emitted_for_event_type,
            emitted_index_of_event_entry_in_shard
          FROM
            assets__non_fungible_token_events a
          WHERE
            EXISTS (
              SELECT
                1
              FROM
                nft_token_meta nft
              WHERE
                nft.contract = a.emitted_by_contract_account_id
                AND nft.token = a.token_id
            )
          ORDER BY
            emitted_at_block_timestamp DESC,
            emitted_in_shard_id DESC,
            emitted_index_of_event_entry_in_shard DESC
          LIMIT
            :limit OFFSET :offset
        ) AS tmp using(
          emitted_for_receipt_id,
          emitted_at_block_timestamp,
          emitted_in_shard_id,
          emitted_for_event_type,
          emitted_index_of_event_entry_in_shard
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
            receipts.receipt_id = assets__non_fungible_token_events.emitted_for_receipt_id
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
              emitted_for_receipt_id,
              emitted_at_block_timestamp,
              emitted_in_shard_id,
              emitted_for_event_type,
              emitted_index_of_event_entry_in_shard
            FROM
              assets__non_fungible_token_events a
            WHERE
              EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.emitted_by_contract_account_id
              )
          '
        ) as count
    `,
  );

  return res.status(200).json({ txns: rows });
});

export default { list, count, txns, txnsCount };
