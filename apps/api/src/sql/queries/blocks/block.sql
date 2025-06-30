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
          $1::TEXT IS NOT NULL
          AND block_hash = $1
        )
        OR (
          $2::BIGINT IS NOT NULL
          AND block_height = $2
        )
      )
      AND block_timestamp >= $3
      AND block_timestamp < $4
    LIMIT
      1
  )
SELECT
  bs.block_timestamp,
  bs.block_height,
  bs.block_hash,
  bs.author_account_id,
  bs.gas_price,
  COALESCE(
    c.agg,
    JSON_BUILD_OBJECT('count', '0', 'gas_used', '0', 'gas_limit', '0')
  ) AS chunks_agg,
  COALESCE(t.agg, JSON_BUILD_OBJECT('count', 0)) AS transactions_agg,
  COALESCE(r.agg, JSON_BUILD_OBJECT('count', 0)) AS receipts_agg
FROM
  block_selected bs
  LEFT JOIN LATERAL (
    SELECT
      included_in_block_hash,
      JSON_BUILD_OBJECT(
        'count',
        COUNT(included_in_block_hash),
        'gas_used',
        SUM(gas_used)::TEXT,
        'gas_limit',
        SUM(gas_limit)::TEXT
      ) AS agg
    FROM
      chunks
    WHERE
      included_in_block_timestamp = (
        SELECT
          block_timestamp
        FROM
          block_selected
      )
      AND included_in_block_hash = bs.block_hash
    GROUP BY
      included_in_block_hash
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      included_in_block_hash,
      JSON_BUILD_OBJECT('count', COUNT(*)) AS agg
    FROM
      transactions
    WHERE
      block_timestamp = (
        SELECT
          block_timestamp
        FROM
          block_selected
      )
      AND included_in_block_hash = bs.block_hash
    GROUP BY
      included_in_block_hash
  ) t ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      included_in_block_hash,
      JSON_BUILD_OBJECT('count', COUNT(*)) AS agg
    FROM
      receipts
    WHERE
      included_in_block_timestamp = (
        SELECT
          block_timestamp
        FROM
          block_selected
      )
      AND included_in_block_hash = bs.block_hash
    GROUP BY
      included_in_block_hash
  ) r ON TRUE
ORDER BY
  bs.block_timestamp DESC
LIMIT
  1
