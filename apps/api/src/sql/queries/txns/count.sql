SELECT
  COUNT(block_timestamp)
FROM
  transactions
WHERE
  (
    ${after}::BIGINT IS NULL
    OR block_timestamp > ${after}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${block}::TEXT IS NULL
    OR included_in_block_hash = ${block}
  )
