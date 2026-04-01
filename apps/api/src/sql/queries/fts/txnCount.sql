SELECT
  COUNT(*)::TEXT AS count
FROM
  ft_events
WHERE
  block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    cause = 'BURN'
    OR delta_amount >= 0
  )
