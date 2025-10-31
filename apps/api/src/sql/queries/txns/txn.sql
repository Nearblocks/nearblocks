WITH
  ${cte:raw}
SELECT
  ts.block_timestamp,
  ts.shard_id,
  ts.index_in_chunk,
  ts.transaction_hash,
  ts.receiver_account_id,
  ts.signer_account_id,
  ts.receipt_conversion_tokens_burnt,
  ts.receipt_conversion_gas_burnt,
  COALESCE(b.block, '{}'::JSONB) AS block,
  COALESCE(a.actions, '[]'::JSONB) AS actions,
  COALESCE(o.outcomes, '{}'::JSONB) AS outcomes,
  aa.actions_agg,
  oa.outcomes_agg
FROM
  txn_selected ts
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'block_hash',
        block_hash,
        'block_height',
        block_height::TEXT,
        'block_timestamp',
        block_timestamp::TEXT
      ) AS block
    FROM
      blocks
    WHERE
      block_timestamp = (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND block_hash = ts.included_in_block_hash
  ) b ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'action',
          action_kind,
          'method',
          args ->> 'method_name'
        )
        ORDER BY
          index_in_action_receipt
      ) AS actions
    FROM
      action_receipt_actions
    WHERE
      receipt_included_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND receipt_included_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND receipt_id = ts.converted_into_receipt_id
  ) a ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'deposit',
        COALESCE(SUM((ar.args ->> 'deposit')::NUMERIC), 0)::TEXT,
        'gas_attached',
        COALESCE(SUM((ar.args ->> 'gas')::NUMERIC), 0)::TEXT
      ) AS actions_agg
    FROM
      action_receipt_actions ar
      JOIN receipts r ON r.receipt_id = ar.receipt_id
    WHERE
      ar.receipt_included_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND ar.receipt_included_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND r.included_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND r.included_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND r.originated_from_transaction_hash = ts.converted_into_receipt_id
  ) aa ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'status',
        (status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')),
        'status_key',
        status
      ) AS outcomes
    FROM
      execution_outcomes
    WHERE
      executed_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND executed_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND receipt_id = ts.converted_into_receipt_id
  ) o ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'transaction_fee',
        (
          COALESCE(ts.receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(eo.tokens_burnt), 0)
        )::TEXT,
        'gas_used',
        (
          COALESCE(ts.receipt_conversion_gas_burnt, 0) + COALESCE(SUM(eo.gas_burnt), 0)
        )::TEXT
      ) AS outcomes_agg
    FROM
      execution_outcomes eo
      JOIN receipts r ON r.receipt_id = eo.receipt_id
    WHERE
      eo.executed_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND eo.executed_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND r.included_in_block_timestamp >= (
        SELECT
          t.block_timestamp
        FROM
          txn_selected t
      )
      AND r.included_in_block_timestamp <= (
        SELECT
          t.block_timestamp + 300000000000 -- 5m in ns
        FROM
          txn_selected t
      )
      AND r.originated_from_transaction_hash = ts.transaction_hash
  ) oa ON TRUE
