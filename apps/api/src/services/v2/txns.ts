import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Txn, TxnReceipts } from '#libs/schema/v2/txns';
import { RequestValidator } from '#types/types';

const txn = catchAsync(async (req: RequestValidator<Txn>, res: Response) => {
  const hash = req.validator.data.hash;

  const txnQuery = sql`
    SELECT
      t.transaction_hash,
      t.signer_account_id,
      t.receiver_account_id,
      t.receipt_conversion_gas_burnt,
      t.receipt_conversion_tokens_burnt,
      c.shard_id,
      JSONB_BUILD_OBJECT(
        'block_hash',
        b.block_hash,
        'block_height',
        b.block_height,
        'block_timestamp',
        b.block_timestamp::TEXT
      ) AS block,
      (
        SELECT
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'action',
              action_receipt_actions.action_kind,
              'method',
              action_receipt_actions.args ->> 'method_name',
              'args',
              jsonb_to_text (action_receipt_actions.args)
            )
          )
        FROM
          action_receipt_actions
          JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          receipts.receipt_id = t.converted_into_receipt_id
      ) AS actions,
      (
        SELECT
          JSONB_BUILD_OBJECT(
            'deposit',
            COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)::TEXT,
            'gas_attached',
            COALESCE(SUM((args ->> 'gas')::NUMERIC), 0)::TEXT
          )
        FROM
          action_receipt_actions
          JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
        WHERE
          receipts.receipt_id = t.converted_into_receipt_id
      ) AS actions_agg,
      (
        SELECT
          JSONB_BUILD_OBJECT(
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
          execution_outcomes.receipt_id = t.converted_into_receipt_id
      ) AS outcomes,
      (
        SELECT
          JSONB_BUILD_OBJECT(
            'transaction_fee',
            (
              COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0)
            )::TEXT,
            'gas_used',
            (
              COALESCE(receipt_conversion_gas_burnt, 0) + COALESCE(SUM(gas_burnt), 0)
            )::TEXT
          )
        FROM
          execution_outcomes
          JOIN receipts ON receipts.receipt_id = execution_outcomes.receipt_id
        WHERE
          receipts.originated_from_transaction_hash = t.transaction_hash
      ) AS outcomes_agg,
      wrap_receipts.receipts
    FROM
      transactions t
      JOIN blocks b ON b.block_hash = t.included_in_block_hash
      JOIN chunks c ON c.chunk_hash = t.included_in_chunk_hash
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(JSONB_AGG(base_receipts), '[]') AS receipts
        FROM
          (
            SELECT
              receipt_id,
              predecessor_account_id,
              receiver_account_id,
              receipt_kind,
              TO_JSONB(wrap_block) AS block,
              TO_JSONB(wrap_outcome) AS outcome,
              wrap_fts.fts,
              wrap_nfts.nfts
            FROM
              receipts
              LEFT JOIN LATERAL (
                SELECT
                  block_hash,
                  block_height,
                  block_timestamp::TEXT
                FROM
                  blocks
                WHERE
                  block_hash = receipts.included_in_block_hash
              ) wrap_block ON TRUE
              LEFT JOIN LATERAL (
                SELECT
                  gas_burnt::TEXT,
                  tokens_burnt::TEXT,
                  executor_account_id,
                  CASE
                    WHEN status = 'SUCCESS_RECEIPT_ID'
                    OR status = 'SUCCESS_VALUE' THEN TRUE
                    ELSE FALSE
                  END AS status,
                  logs
                FROM
                  execution_outcomes
                WHERE
                  receipt_id = receipts.receipt_id
              ) wrap_outcome ON TRUE
              LEFT JOIN LATERAL (
                SELECT
                  COALESCE(JSONB_AGG(base_fts), '[]') AS fts
                FROM
                  (
                    SELECT
                      event_index,
                      affected_account_id,
                      involved_account_id,
                      delta_amount::TEXT,
                      cause,
                      block_timestamp::TEXT,
                      TO_JSONB(wrap_ft_meta) AS ft_meta
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
                      receipt_id = receipts.receipt_id
                    ORDER BY
                      event_index ASC
                  ) AS base_fts
              ) wrap_fts ON TRUE
              LEFT JOIN LATERAL (
                SELECT
                  COALESCE(JSONB_AGG(base_nfts), '[]') AS nfts
                FROM
                  (
                    SELECT
                      event_index,
                      affected_account_id,
                      involved_account_id,
                      delta_amount,
                      token_id,
                      cause,
                      block_timestamp::TEXT,
                      TO_JSONB(wrap_nft_meta) AS nft_meta,
                      TO_JSONB(wrap_nft_token_meta) AS nft_token_meta
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
                      receipt_id = receipts.receipt_id
                    ORDER BY
                      event_index ASC
                  ) AS base_nfts
              ) wrap_nfts ON TRUE
            WHERE
              originated_from_transaction_hash = t.transaction_hash
            ORDER BY
              id ASC
          ) AS base_receipts
      ) wrap_receipts ON TRUE
  `;

  if (hash.startsWith('0x')) {
    const txns = await sql`
      ${txnQuery}
      JOIN receipts r ON r.originated_from_transaction_hash = t.transaction_hash
      JOIN action_receipt_actions ara ON r.receipt_id = ara.receipt_id
      WHERE
        ara.nep518_rlp_hash = ${hash}
      LIMIT
        1
    `;

    return res.status(200).json({ txns });
  }

  const txns = await sql`
    ${txnQuery}
    WHERE
      t.transaction_hash = ${hash}
  `;

  return res.status(200).json({ txns });
});

const txnReceipts = catchAsync(
  async (req: RequestValidator<TxnReceipts>, res: Response) => {
    const hash = req.validator.data.hash;

    const txnQuery = sql`
      SELECT
        receipt_tree (t.converted_into_receipt_id)
      FROM
        transactions t
    `;

    if (hash.startsWith('0x')) {
      const receipts = await sql`
        ${txnQuery}
        JOIN receipts r ON r.originated_from_transaction_hash = t.transaction_hash
        JOIN action_receipt_actions ara ON r.receipt_id = ara.receipt_id
        WHERE
          ara.nep518_rlp_hash = ${hash}
        LIMIT
          1
      `;

      return res.status(200).json({ receipts });
    }

    const receipts = await sql`
      ${txnQuery}
      WHERE
        t.transaction_hash = ${hash}
    `;

    return res.status(200).json({ receipts });
  },
);

export default { txn, txnReceipts };
