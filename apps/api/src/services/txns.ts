import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import { Count, Item, Latest, List } from '#libs/schema/txns';
import { getPagination, msToNsTime } from '#libs/utils';
import { RequestValidator } from '#types/types';

const EXPIRY = 5; // 5 sec

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const block = req.validator.data.block;
  const from = req.validator.data.from;
  const to = req.validator.data.to;
  const action = req.validator.data.action;
  const method = req.validator.data.method;
  const cursor = req.validator.data.cursor;
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

  const { limit, offset } = getPagination(page, per_page);
  const txns = await sql`
    SELECT
      id,
      transaction_hash,
      included_in_block_hash,
      block_timestamp,
      signer_account_id,
      receiver_account_id,
      (
        SELECT
          JSON_BUILD_OBJECT('block_height', block_height)
        FROM
          blocks
        WHERE
          blocks.block_hash = temp_transactions.included_in_block_hash
      ) AS block,
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'action',
              action_receipt_actions.action_kind,
              'method',
              action_receipt_actions.args ->> 'method_name'
            )
          )
        FROM
          action_receipt_actions
          JOIN temp_receipts ON temp_receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          temp_receipts.receipt_id = temp_transactions.converted_into_receipt_id
      ) AS actions,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'deposit',
            COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
          )
        FROM
          action_receipt_actions
          JOIN temp_receipts ON temp_receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          temp_receipts.receipt_id = temp_transactions.converted_into_receipt_id
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
          execution_outcomes.receipt_id = temp_transactions.converted_into_receipt_id
      ) AS outcomes,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'transaction_fee',
            COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0)
          )
        FROM
          execution_outcomes
          JOIN temp_receipts ON temp_receipts.receipt_id = execution_outcomes.receipt_id
        WHERE
          temp_receipts.originated_from_transaction_hash = temp_transactions.transaction_hash
      ) AS outcomes_agg
    FROM
      temp_transactions
      INNER JOIN (
        SELECT
          transaction_hash
        FROM
          temp_transactions
        WHERE
          ${block ? sql`included_in_block_hash = ${block}` : true}
          AND ${from ? sql`signer_account_id = ${from}` : true}
          AND ${to ? sql`receiver_account_id = ${to}` : true}
          AND ${cursor
      ? sql`id ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
      : true}
          AND ${afterTimestamp
      ? sql`block_timestamp >= ${afterTimestamp}`
      : true}
          AND ${beforeTimestamp
      ? sql`block_timestamp < ${beforeTimestamp}`
      : true}
          AND ${action || method
      ? sql`
          EXISTS (
            SELECT
              1
            FROM
              temp_receipts r
            WHERE
              r.receipt_id = temp_transactions.converted_into_receipt_id
              AND EXISTS (
                SELECT
                  1
                FROM
                  action_receipt_actions a
                WHERE
                  a.receipt_id = r.receipt_id
                  AND ${action ? sql`a.action_kind = ${action}` : true}
                  AND ${method
            ? sql`a.args ->> 'method_name' = ${method}`
            : true}
              )
          )
        `
      : true}
        ORDER BY
          id ${order === 'desc' ? sql`DESC` : sql`ASC`}
        LIMIT
          ${limit}
        OFFSET
          ${cursor ? 0 : offset}
      ) AS tmp using (transaction_hash)
  `;

  let nextCursor = txns?.[txns?.length - 1]?.id;
  nextCursor = txns?.length === per_page && nextCursor ? nextCursor : undefined;

  return res.status(200).json({ cursor: nextCursor, txns });
});

const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const block = req.validator.data.block;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const action = req.validator.data.action;
    const method = req.validator.data.method;
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

    if (
      !block &&
      !from &&
      !to &&
      !action &&
      !method &&
      !afterTimestamp &&
      !beforeTimestamp
    ) {
      const txns = await sql`
        SELECT
          count_estimate ('SELECT
          transaction_hash
        FROM
          temp_transactions') as count
      `;

      return res.status(200).json({ txns });
    }

    const txns = await sql`
      SELECT
        COUNT(transaction_hash)
      FROM
        temp_transactions
      WHERE
        ${block ? sql`included_in_block_hash = ${block}` : true}
        AND ${from ? sql`signer_account_id = ${from}` : true}
        AND ${to ? sql`receiver_account_id = ${to}` : true}
        AND ${afterTimestamp ? sql`block_timestamp >= ${afterTimestamp}` : true}
        AND ${beforeTimestamp
        ? sql`block_timestamp < ${beforeTimestamp}`
        : true}
        AND ${action || method
        ? sql`
            EXISTS (
              SELECT
                1
              FROM
                temp_receipts r
              WHERE
                r.receipt_id = temp_transactions.converted_into_receipt_id
                AND EXISTS (
                  SELECT
                    1
                  FROM
                    action_receipt_actions a
                  WHERE
                    a.receipt_id = r.receipt_id
                    AND ${action ? sql`a.action_kind = ${action}` : true}
                    AND ${method
              ? sql`a.args ->> 'method_name' = ${method}`
              : true}
                )
            )
          `
        : true}
    `;

    return res.status(200).json({ txns });
  },
);

const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const query = sql`
      SELECT
        transaction_hash,
        block_timestamp,
        signer_account_id,
        receiver_account_id,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'deposit',
              COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)
            )
          FROM
            action_receipt_actions
            JOIN temp_receipts ON temp_receipts.receipt_id = action_receipt_actions.receipt_id
          WHERE
            temp_receipts.receipt_id = temp_transactions.converted_into_receipt_id
        ) AS actions_agg
      FROM
        temp_transactions
      ORDER BY
        block_timestamp DESC,
        index_in_chunk DESC
      LIMIT
        ${limit}
    `;

    const txns = await redis.cache(
      'txns:latest',
      async () => {
        try {
          return await query;
        } catch (error) {
          return null;
        }
      },
      EXPIRY,
    );

    return res.status(200).json({ txns });
  },
);

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const hash = req.validator.data.hash;

  const txns = await sql`
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
          shard_id
        FROM
          chunks
        WHERE
          chunks.chunk_hash = temp_transactions.included_in_chunk_hash
      ) AS shard_id,
      (
        SELECT
          JSON_BUILD_OBJECT('block_height', block_height)
        FROM
          blocks
        WHERE
          blocks.block_hash = temp_transactions.included_in_block_hash
      ) AS block,
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'action',
              action_receipt_actions.action_kind,
              'method',
              action_receipt_actions.args ->> 'method_name'
            )
          )
        FROM
          action_receipt_actions
          JOIN temp_receipts ON temp_receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          temp_receipts.receipt_id = temp_transactions.converted_into_receipt_id
      ) AS actions,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'deposit',
            COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0),
            'gas_attached',
            COALESCE(SUM((args ->> 'gas')::NUMERIC), 0)
          )
        FROM
          action_receipt_actions
          JOIN temp_receipts ON temp_receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          temp_receipts.receipt_id = temp_transactions.converted_into_receipt_id
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
          execution_outcomes.receipt_id = temp_transactions.converted_into_receipt_id
      ) AS outcomes,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'transaction_fee',
            COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0),
            'gas_used',
            COALESCE(receipt_conversion_gas_burnt, 0) + COALESCE(SUM(gas_burnt), 0)
          )
        FROM
          execution_outcomes
          JOIN temp_receipts ON temp_receipts.receipt_id = execution_outcomes.receipt_id
        WHERE
          temp_receipts.originated_from_transaction_hash = temp_transactions.transaction_hash
      ) AS outcomes_agg,
      wrap_receipts.temp_receipts
    FROM
      temp_transactions
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(JSON_AGG(base_receipts), '[]') AS temp_receipts
        FROM
          (
            SELECT
              wrap_fts.fts,
              wrap_nfts.nfts
            FROM
              temp_receipts
              LEFT JOIN LATERAL (
                SELECT
                  COALESCE(JSON_AGG(base_fts), '[]') AS fts
                FROM
                  (
                    SELECT
                      event_index,
                      affected_account_id,
                      involved_account_id,
                      delta_amount,
                      cause,
                      block_timestamp,
                      ROW_TO_JSON(wrap_ft_meta) AS ft_meta
                    FROM
                      ft_events
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
                          contract = ft_events.contract_account_id
                      ) wrap_ft_meta ON TRUE
                    WHERE
                      receipt_id = temp_receipts.receipt_id
                    ORDER BY
                      event_index ASC
                  ) AS base_fts
              ) wrap_fts ON TRUE
              LEFT JOIN LATERAL (
                SELECT
                  COALESCE(JSON_AGG(base_nfts), '[]') AS nfts
                FROM
                  (
                    SELECT
                      event_index,
                      affected_account_id,
                      involved_account_id,
                      delta_amount,
                      token_id,
                      cause,
                      block_timestamp,
                      ROW_TO_JSON(wrap_nft_meta) AS nft_meta,
                      ROW_TO_JSON(wrap_nft_token_meta) AS nft_token_meta
                    FROM
                      nft_events
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
                          contract = nft_events.contract_account_id
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
                          contract = nft_events.contract_account_id
                          AND token = nft_events.token_id
                      ) wrap_nft_token_meta ON TRUE
                    WHERE
                      receipt_id = temp_receipts.receipt_id
                    ORDER BY
                      event_index ASC
                  ) AS base_nfts
              ) wrap_nfts ON TRUE
            WHERE
              originated_from_transaction_hash = temp_transactions.transaction_hash
            ORDER BY
              included_in_block_timestamp ASC
          ) AS base_receipts
      ) wrap_receipts ON TRUE
    WHERE
      transaction_hash = ${hash}
  `;

  return res.status(200).json({ txns });
});

export default { count, item, latest, list };
