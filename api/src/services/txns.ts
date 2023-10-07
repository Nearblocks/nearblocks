import { Response } from 'express';

import db from '#libs/db';
import { cache } from '#libs/redis';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { keyBinder, getPagination } from '#libs/utils';
import { List, Count, Latest, Item } from '#libs/schema/txns';

const EXPIRY = 5; // 5 sec

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const block = req.validator.data.block;
  const from = req.validator.data.from;
  const to = req.validator.data.to;
  const action = req.validator.data.action;
  const method = req.validator.data.method;
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const order = req.validator.data.order;

  const { limit, offset } = getPagination(page, per_page);
  // Use the same inner join query for count query below
  const { query, values } = keyBinder(
    `
      SELECT
        transaction_hash,
        included_in_block_hash,
        block_timestamp,
        signer_account_id,
        receiver_account_id,
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
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.receipt_id = transactions.converted_into_receipt_id
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
        INNER JOIN (
          SELECT
            transaction_hash
          FROM
            transactions
          WHERE
            ${block ? `included_in_block_hash = :block` : true}
            AND ${from ? `signer_account_id = :from` : true}
            AND ${to ? `receiver_account_id = :to` : true}
            AND ${
              action || method
                ? `EXISTS (
                    SELECT
                      1
                    FROM
                      receipts r
                    WHERE
                      r.receipt_id = transactions.converted_into_receipt_id
                      AND EXISTS (
                        SELECT
                          1
                        FROM
                          action_receipt_actions a
                        WHERE
                          a.receipt_id = r.receipt_id
                          AND ${action ? `a.action_kind = :action` : true}
                          AND ${
                            method ? `a.args ->> 'method_name' = :method` : true
                          }
                      )
                  )`
                : true
            }
          ORDER BY
            block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
            index_in_chunk ${order === 'desc' ? 'DESC' : 'ASC'}
          LIMIT
            :limit OFFSET :offset
        ) AS tmp using(transaction_hash)
    `,
    { block, from, to, limit, offset, action, method },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ txns: rows });
});

const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const block = req.validator.data.block;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;

    if (!block && !from && !to && !action && !method) {
      const { rows } = await db.query(
        `
          SELECT
            count_estimate(
              'SELECT
                transaction_hash
              FROM
                transactions'
            ) as count
        `,
      );

      return res.status(200).json({ txns: rows });
    }

    // Use the same query from the txn inner join here
    const { query, values } = keyBinder(
      `
        SELECT
          COUNT(transaction_hash)
        FROM
          transactions
        WHERE
          ${block ? `included_in_block_hash = :block` : true}
          AND ${from ? `signer_account_id = :from` : true}
          AND ${to ? `receiver_account_id = :to` : true}
          AND ${
            action || method
              ? `EXISTS (
                  SELECT
                    1
                  FROM
                    receipts r
                  WHERE
                    r.receipt_id = transactions.converted_into_receipt_id
                    AND EXISTS (
                      SELECT
                        1
                      FROM
                        action_receipt_actions a
                      WHERE
                        a.receipt_id = r.receipt_id
                        AND ${action ? `a.action_kind = :action` : true}
                        AND ${
                          method ? `a.args ->> 'method_name' = :method` : true
                        }
                    )
                )`
              : true
          }
      `,
      { block, from, to, action, method },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const { query, values } = keyBinder(
      `
        SELECT
          transaction_hash,
          block_timestamp,
          signer_account_id,
          receiver_account_id,
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
          ) AS actions_agg
        FROM
          transactions
        ORDER BY
          block_timestamp DESC,
          index_in_chunk DESC
        LIMIT :limit
      `,
      { limit },
    );

    const txns = await cache(
      'txns:latest',
      async () => {
        try {
          const { rows } = await db.query(query, values);

          return rows;
        } catch (error) {
          return null;
        }
      },
      { EX: EXPIRY },
    );

    return res.status(200).json({ txns });
  },
);

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const hash = req.validator.data.hash;

  const { query, values } = keyBinder(
    `
      SELECT
        transaction_hash,
        included_in_block_hash,
        block_timestamp,
        signer_account_id,
        receiver_account_id,
        receipt_conversion_gas_burnt,
        receipt_conversion_tokens_burnt,
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
            JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
          WHERE
            receipts.receipt_id = transactions.converted_into_receipt_id
        ) AS actions,
        (
          SELECT
            json_build_object(
              'deposit',
              COALESCE(SUM((args ->> 'deposit') :: NUMERIC), 0),
              'gas_attached',
              COALESCE(SUM((args ->> 'gas') :: NUMERIC), 0)
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
              COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0),
              'gas_used',
              COALESCE(receipt_conversion_gas_burnt, 0) + COALESCE(SUM(gas_burnt), 0)
            )
          FROM
            execution_outcomes
            JOIN receipts ON receipts.receipt_id = execution_outcomes.receipt_id
          WHERE
            receipts.originated_from_transaction_hash = transactions.transaction_hash
        ) AS outcomes_agg,
        wrap_receipts.receipts
      FROM
        transactions
        LEFT JOIN LATERAL (
          SELECT
            coalesce(json_agg(base_receipts), '[]') AS receipts
          FROM
            (
              SELECT
                wrap_fts.fts,
                wrap_nfts.nfts
              FROM
                receipts
                LEFT JOIN LATERAL (
                  SELECT
                    coalesce(json_agg(base_fts), '[]') AS fts
                  FROM
                    (
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
                        emitted_at_block_timestamp,
                        row_to_json(wrap_ft_meta) AS ft_meta
                      FROM
                        assets__fungible_token_events
                        LEFT JOIN LATERAL (
                          SELECT
                            contract,
                            name,
                            symbol,
                            icon,
                            decimals
                          FROM
                            ft_meta
                          WHERE
                            contract = assets__fungible_token_events.emitted_by_contract_account_id
                        ) wrap_ft_meta ON TRUE
                      WHERE
                        emitted_for_receipt_id = receipts.receipt_id
                      ORDER BY
                        emitted_at_block_timestamp ASC,
                        emitted_in_shard_id ASC,
                        emitted_for_event_type ASC,
                        emitted_index_of_event_entry_in_shard ASC
                    ) AS base_fts
                ) wrap_fts ON TRUE
                LEFT JOIN LATERAL (
                  SELECT
                    coalesce(json_agg(base_nfts), '[]') AS nfts
                  FROM
                    (
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
                        emitted_at_block_timestamp,
                        row_to_json(wrap_nft_meta) AS nft_meta,
                        row_to_json(wrap_nft_token_meta) AS nft_token_meta
                      FROM
                        assets__non_fungible_token_events
                        LEFT JOIN LATERAL (
                          SELECT
                            contract,
                            name,
                            symbol,
                            icon,
                            base_uri,
                            reference
                          FROM
                            nft_meta
                          WHERE
                            contract = assets__non_fungible_token_events.emitted_by_contract_account_id
                        ) wrap_nft_meta ON TRUE
                        LEFT JOIN LATERAL (
                          SELECT
                            token,
                            title,
                            media,
                            reference
                          FROM
                            nft_token_meta
                          WHERE
                            contract = assets__non_fungible_token_events.emitted_by_contract_account_id
                            AND token = assets__non_fungible_token_events.token_id
                        ) wrap_nft_token_meta ON TRUE
                      WHERE
                        emitted_for_receipt_id = receipts.receipt_id
                      ORDER BY
                        emitted_at_block_timestamp ASC,
                        emitted_in_shard_id ASC,
                        emitted_for_event_type ASC,
                        emitted_index_of_event_entry_in_shard ASC
                    ) AS base_nfts
                ) wrap_nfts ON TRUE
              WHERE
                originated_from_transaction_hash = transactions.transaction_hash
              ORDER BY
                included_in_block_timestamp ASC
            ) AS base_receipts
        ) wrap_receipts ON TRUE
      WHERE
        transaction_hash = :hash
    `,
    { hash },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ txns: rows });
});

export default { list, count, latest, item };
