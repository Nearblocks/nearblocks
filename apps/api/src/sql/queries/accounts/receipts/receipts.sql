WITH
  ${cte:raw}
SELECT
  rs.included_in_block_timestamp,
  rs.shard_id,
  rs.index_in_chunk,
  rs.receipt_id,
  rs.originated_from_transaction_hash AS transaction_hash,
  rs.predecessor_account_id,
  rs.receiver_account_id,
  COALESCE(b.block, '{}'::JSONB) AS block,
  COALESCE(a.actions, '[]'::JSONB) AS actions,
  COALESCE(o.outcome, '{}'::JSONB) AS outcome,
  aa.actions_agg
FROM
  receipts_selected rs
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
      block_timestamp = rs.included_in_block_timestamp
      AND block_hash = rs.included_in_block_hash
  ) b ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_AGG(
        JSONB_BUILD_OBJECT('action', action_kind, 'method', method)
        ORDER BY
          index_in_action_receipt
      ) AS actions
    FROM
      action_receipt_actions
    WHERE
      receipt_included_in_block_timestamp = rs.included_in_block_timestamp
      AND receipt_id = rs.receipt_id
  ) a ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'deposit',
        COALESCE(SUM((args ->> 'deposit')::NUMERIC), 0)::TEXT
      ) AS actions_agg
    FROM
      action_receipt_actions
    WHERE
      receipt_included_in_block_timestamp = rs.included_in_block_timestamp
      AND receipt_id = rs.receipt_id
  ) aa ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'status',
        (status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE'))
      ) AS outcome
    FROM
      execution_outcomes
    WHERE
      executed_in_block_timestamp >= rs.included_in_block_timestamp
      AND executed_in_block_timestamp <= rs.included_in_block_timestamp + 300000000000 -- 5m in ns
      AND receipt_id = rs.receipt_id
  ) o ON TRUE
ORDER BY
  rs.included_in_block_timestamp DESC,
  rs.shard_id DESC,
  rs.index_in_chunk DESC
