SELECT
  COUNT(*)::TEXT AS count
FROM
  ft_events
WHERE
  contract_account_id = ${contract}
  AND block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${affected}::TEXT IS NULL
    OR affected_account_id = ${affected}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    ${affected}::TEXT IS NOT NULL
    OR cause = 'BURN'
    OR delta_amount >= 0
  )
