SELECT
  COUNT(block_timestamp),
  '0' AS cost
FROM
  transactions
WHERE
  (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${block}::TEXT IS NULL
    OR included_in_block_hash = ${block}
  )
