WITH
  receipts_selected AS (
    SELECT
      *
    FROM
      (
        VALUES
          ${receipts:raw}
      ) AS t (
        account_id,
        block_timestamp,
        event_index,
        public_key,
        receipt_id,
        dest_address,
        dest_chain,
        dest_txn
      )
  )
SELECT
  rs.account_id,
  rs.block_timestamp,
  rs.event_index,
  rs.public_key,
  rs.receipt_id,
  rs.dest_address,
  rs.dest_chain,
  rs.dest_txn,
  t.transaction_hash,
  t.block
FROM
  receipts r
  JOIN receipts_selected rs ON r.receipt_id = rs.receipt_id
  AND r.included_in_block_timestamp = rs.block_timestamp::BIGINT
  JOIN LATERAL (
    SELECT
      t.transaction_hash,
      COALESCE(b.block, '{}'::JSONB) AS block
    FROM
      transactions t
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
          block_timestamp = t.block_timestamp
          AND block_hash = t.included_in_block_hash
      ) b ON TRUE
    WHERE
      t.transaction_hash = r.originated_from_transaction_hash
      AND t.block_timestamp <= r.included_in_block_timestamp
      AND t.block_timestamp >= r.included_in_block_timestamp - 300000000000 -- 5m in ns
  ) t ON TRUE
