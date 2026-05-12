receipts_selected AS (
  (
    SELECT
      r.included_in_block_timestamp,
      r.shard_id,
      r.index_in_chunk,
      r.receipt_id,
      r.receiver_account_id,
      r.predecessor_account_id,
      r.included_in_block_hash,
      r.originated_from_transaction_hash
    FROM
      receipts r
    WHERE
      r.predecessor_account_id = ${account}
      AND r.receipt_kind = 'ACTION'
      AND r.included_in_block_timestamp >= ${start}::BIGINT
      AND r.included_in_block_timestamp <= ${end}::BIGINT
      AND EXISTS (
        SELECT
          1
        FROM
          action_receipt_actions a
        WHERE
          a.receipt_id = r.receipt_id
          AND a.receipt_included_in_block_timestamp = r.included_in_block_timestamp
      )
    ORDER BY
      r.included_in_block_timestamp ASC,
      r.shard_id ASC,
      r.index_in_chunk ASC
    LIMIT
      5000
  )
  UNION
  (
    SELECT
      r.included_in_block_timestamp,
      r.shard_id,
      r.index_in_chunk,
      r.receipt_id,
      r.receiver_account_id,
      r.predecessor_account_id,
      r.included_in_block_hash,
      r.originated_from_transaction_hash
    FROM
      receipts r
    WHERE
      r.receiver_account_id = ${account}
      AND r.receipt_kind = 'ACTION'
      AND r.included_in_block_timestamp >= ${start}::BIGINT
      AND r.included_in_block_timestamp <= ${end}::BIGINT
      AND EXISTS (
        SELECT
          1
        FROM
          action_receipt_actions a
        WHERE
          a.receipt_id = r.receipt_id
          AND a.receipt_included_in_block_timestamp = r.included_in_block_timestamp
      )
    ORDER BY
      r.included_in_block_timestamp ASC,
      r.shard_id ASC,
      r.index_in_chunk ASC
    LIMIT
      5000
  )
)
