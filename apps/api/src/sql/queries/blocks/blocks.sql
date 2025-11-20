WITH
  blocks_selected AS (
    SELECT
      block_timestamp,
      block_height,
      block_hash,
      gas_price,
      author_account_id,
      prev_block_hash
    FROM
      blocks
    WHERE
      (
        ${cursor.timestamp}::BIGINT IS NULL
        OR (
          ${direction} = 'desc'
          AND block_timestamp < ${cursor.timestamp}
        )
        OR (
          ${direction} = 'asc'
          AND block_timestamp > ${cursor.timestamp}
        )
      )
      AND (
        ${start}::BIGINT IS NULL
        OR block_timestamp >= ${start} -- rolling window start
      )
      AND (
        ${end}::BIGINT IS NULL
        OR block_timestamp <= ${end} -- rolling window end
      )
    ORDER BY
      block_timestamp ${direction:raw}
    LIMIT
      ${limit}
  )
SELECT
  bs.block_timestamp,
  bs.block_height,
  bs.block_hash,
  bs.author_account_id,
  bs.gas_price,
  bs.prev_block_hash,
  c.chunks_agg,
  t.transactions_agg,
  r.receipts_agg
FROM
  blocks_selected bs
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'count',
        COUNT(included_in_block_hash),
        'gas_used',
        COALESCE(SUM(gas_used)::TEXT, '0'),
        'gas_limit',
        COALESCE(SUM(gas_limit)::TEXT, '0')
      ) AS chunks_agg
    FROM
      chunks
    WHERE
      included_in_block_timestamp >= (
        SELECT
          MIN(b.block_timestamp)
        FROM
          blocks_selected b
      )
      AND included_in_block_timestamp <= (
        SELECT
          MAX(b.block_timestamp) + 300000000000 -- 5m in ns
        FROM
          blocks_selected b
      )
      AND included_in_block_hash = bs.block_hash
  ) c ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('count', COUNT(*)) AS transactions_agg
    FROM
      transactions
    WHERE
      block_timestamp >= (
        SELECT
          MIN(b.block_timestamp)
        FROM
          blocks_selected b
      )
      AND block_timestamp <= (
        SELECT
          MAX(b.block_timestamp) + 300000000000 -- 5m in ns
        FROM
          blocks_selected b
      )
      AND included_in_block_hash = bs.block_hash
  ) t ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('count', COUNT(*)) AS receipts_agg
    FROM
      receipts
    WHERE
      included_in_block_timestamp >= (
        SELECT
          MIN(b.block_timestamp)
        FROM
          blocks_selected b
      )
      AND included_in_block_timestamp <= (
        SELECT
          MAX(b.block_timestamp) + 300000000000 -- 5m in ns
        FROM
          blocks_selected b
      )
      AND included_in_block_hash = bs.block_hash
  ) r ON TRUE
ORDER BY
  bs.block_timestamp DESC
