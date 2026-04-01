SELECT
  COUNT(*)::TEXT AS count
FROM
  transactions
WHERE
  block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${block}::TEXT IS NULL
    OR included_in_block_hash = ${block}
  )
