SELECT
  COUNT(*)::TEXT AS count
FROM
  staking_events
WHERE
  account = ${account}
  AND block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${contract}::TEXT IS NULL
    OR contract = ${contract}
  )
  AND (
    ${type}::TEXT IS NULL
    OR type = ${type}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
