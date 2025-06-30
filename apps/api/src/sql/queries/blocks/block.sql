WITH
  block_selected AS (
    SELECT
      block_timestamp,
      block_height,
      block_hash,
      gas_price,
      author_account_id
    FROM
      blocks
    WHERE
      (
        (
          ${hash}::TEXT IS NOT NULL
          AND block_hash = ${hash}
        )
        OR (
          ${height}::BIGINT IS NOT NULL
          AND block_height = ${height}
        )
      )
      AND block_timestamp >= ${start} -- rolling window start
      AND block_timestamp <= ${end} -- rolling window end
    LIMIT
      1
  )
SELECT
  bs.block_timestamp,
  bs.block_height,
  bs.block_hash,
  bs.author_account_id,
  bs.gas_price,
  c.chunks_agg,
  t.transactions_agg,
  r.receipts_agg
FROM
  block_selected bs
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'count',
        COUNT(included_in_block_hash),
        'gas_used',
        SUM(gas_used)::TEXT,
        'gas_limit',
        SUM(gas_limit)::TEXT
      ) AS chunks_agg
    FROM
      chunks
    WHERE
      included_in_block_timestamp = bs.block_timestamp
      AND included_in_block_hash = bs.block_hash
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('count', COUNT(*)) AS transactions_agg
    FROM
      transactions
    WHERE
      block_timestamp = bs.block_timestamp
      AND included_in_block_hash = bs.block_hash
  ) t ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('count', COUNT(*)) AS receipts_agg
    FROM
      receipts
    WHERE
      included_in_block_timestamp = bs.block_timestamp
      AND included_in_block_hash = bs.block_hash
  ) r ON TRUE
ORDER BY
  bs.block_timestamp DESC
LIMIT
  1
