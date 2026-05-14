SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      staking_events
    WHERE
      block_timestamp >= ${start}::BIGINT
      AND block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
    LIMIT
      ${limit}::INT
  ) t
