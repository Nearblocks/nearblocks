import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import db from '#libs/db';
import { FtTxns, FtTxnsCount, Holders, Item } from '#libs/schema/fts';
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
        list.onchain_market_cap,
        list.transfers,
        list.holders
      FROM
        ft_meta
        LEFT JOIN LATERAL (
          SELECT
            onchain_market_cap,
            transfers,
            holders
          FROM
            ft_list
          WHERE
            contract = ft_meta.contract
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
  async (req: RequestValidator<FtTxns>, res: Response) => {
    const contract = req.validator.data.contract;
    const account = req.validator.data.a;
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
          amount,
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
              ft_meta.contract = emitted_by_contract_account_id
          ) AS ft
        FROM
          assets__fungible_token_events
          INNER JOIN (
            SELECT
              emitted_for_receipt_id,
              emitted_at_block_timestamp,
              emitted_in_shard_id,
              emitted_for_event_type,
              emitted_index_of_event_entry_in_shard
            FROM
              assets__fungible_token_events a
            WHERE
              emitted_by_contract_account_id = :contract
              ${
                account
                  ? `
                    AND (
                      token_old_owner_account_id = :account
                      OR token_new_owner_account_id = :account
                    )
                  `
                  : `
                    AND ${from ? `token_old_owner_account_id = :from` : true}
                    AND ${to ? `token_new_owner_account_id = :to` : true}
                  `
              }
              AND ${event ? `event_kind = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  ft_meta ft
                WHERE
                  ft.contract = a.emitted_by_contract_account_id
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
              receipts.receipt_id = assets__fungible_token_events.emitted_for_receipt_id
          ) txn ON TRUE
        ORDER BY
          emitted_at_block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_in_shard_id ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_index_of_event_entry_in_shard ${
            order === 'desc' ? 'DESC' : 'ASC'
          }
      `,
      { account, contract, event, from, limit, offset, to },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<FtTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const account = req.validator.data.a;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;

    const useFormat = true;
    const bindings = { account, contract, event, from, to };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        assets__fungible_token_events a
      WHERE
        emitted_by_contract_account_id = :contract
        ${
          account
            ? `
              AND (
                token_old_owner_account_id = :account
                OR token_new_owner_account_id = :account
              )
            `
            : `
              AND ${from ? `token_old_owner_account_id = :from` : true}
              AND ${to ? `token_new_owner_account_id = :to` : true}
            `
        }
        AND ${event ? `event_kind = :event` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            ft_meta ft
          WHERE
            ft.contract = a.emitted_by_contract_account_id
        )
    `;

    const { query, values } = keyBinder(
      rawQuery({
        select: 'emitted_for_receipt_id',
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
        select: 'COUNT(emitted_for_receipt_id)',
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
          amount
        FROM
          ft_holders
        WHERE
          contract = :contract
          AND account <> ''
          AND amount > 0
        ORDER BY
          amount ${order === 'desc' ? 'DESC' : 'ASC'}
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
          COUNT(account)
        FROM
          ft_holders
        WHERE
          contract = :contract
          AND account <> ''
          AND amount > 0
      `,
      { contract },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ holders: rows });
  },
);

export default { holders, holdersCount, item, txns, txnsCount };
