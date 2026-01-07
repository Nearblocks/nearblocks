SELECT
  block_hash,
  block_height
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
