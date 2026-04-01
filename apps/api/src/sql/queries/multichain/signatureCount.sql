SELECT
  COUNT(*)::TEXT AS count
FROM
  multichain_signatures
WHERE
  block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${account}::TEXT IS NULL
    OR account_id = ${account}
  )
