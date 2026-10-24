SELECT
  1
FROM
  staking_events
WHERE
  block_timestamp >= ${start}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
