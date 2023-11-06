import { Response } from 'express';

import db from '#libs/db';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { keyBinder, getPagination } from '#libs/utils';
import { Item, NftTxns, NftTxnsCount, Holders } from '#libs/schema/nfts';

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
        list.tokens,
        list.transfers,
        list.holders
      FROM
        nft_meta
        LEFT JOIN LATERAL (
          SELECT
            tokens,
            transfers,
            holders
          FROM
            nft_list
          WHERE
            contract = nft_meta.contract
        ) list ON TRUE
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
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);
    // Use the same inner join query for txn count query below
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
              emitted_by_contract_account_id = :contract
              AND ${from ? `token_old_owner_account_id = :from` : true}
              AND ${to ? `token_new_owner_account_id = :to` : true}
              AND ${event ? `event_kind = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.emitted_by_contract_account_id
              )
            ORDER BY
              emitted_at_block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
              emitted_in_shard_id ${order === 'desc' ? 'DESC' : 'ASC'},
              emitted_index_of_event_entry_in_shard ${
                order === 'desc' ? 'DESC' : 'ASC'
              }
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
        ORDER BY
          emitted_at_block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_in_shard_id ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_index_of_event_entry_in_shard ${
            order === 'desc' ? 'DESC' : 'ASC'
          }
      `,
      { contract, from, to, limit, offset, event },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;

    const useFormat = true;
    // Use the same query from the txn inner join here
    const { query, values } = keyBinder(
      `
        SELECT
          emitted_for_receipt_id,
          emitted_at_block_timestamp,
          emitted_in_shard_id,
          emitted_for_event_type,
          emitted_index_of_event_entry_in_shard
        FROM
          assets__non_fungible_token_events a
        WHERE
          emitted_by_contract_account_id = :contract
          AND ${from ? `token_old_owner_account_id = :from` : true}
          AND ${to ? `token_new_owner_account_id = :to` : true}
          AND ${event ? `event_kind = :event` : true}
          AND EXISTS (
            SELECT
              1
            FROM
              nft_meta nft
            WHERE
              nft.contract = a.emitted_by_contract_account_id
          )
      `,
      { contract, from, to, event },
      useFormat,
    );

    const { rows } = await db.query(
      `SELECT count_estimate(${query}) as count`,
      values,
    );

    return res.status(200).json({ txns: rows });
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
          quantity
        FROM
          nft_holders
        WHERE
          contract = :contract
          AND account <> ''
          AND quantity > 0
        ORDER BY
          quantity ${order === 'desc' ? 'DESC' : 'ASC'}
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
          COUNT(quantity)
        FROM
          nft_holders
        WHERE
          contract = :contract
          AND account <> ''
          AND quantity > 0
      `,
      { contract },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ holders: rows });
  },
);

export default { item, txns, txnsCount, holders, holdersCount };
