SELECT
  COUNT(*)::TEXT AS count
FROM
  nft_events
WHERE
  contract_account_id = ${contract}
  AND token_id = ${token}
  AND block_timestamp >= ${start}::BIGINT
  AND block_timestamp <= ${end}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR block_timestamp < ${before}
  )
  AND (
    cause = 'BURN'
    OR delta_amount >= 0
  )
