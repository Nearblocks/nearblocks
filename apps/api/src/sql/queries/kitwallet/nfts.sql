SELECT
  contract_account_id
FROM
  nft_events
WHERE
  affected_account_id = ${account}
  AND (
    ${from}::BIGINT IS NULL
    OR block_timestamp > ${from}
  )
  AND (
    ${last}::BIGINT IS NULL
    OR block_timestamp <= ${last}
  )
GROUP BY
  contract_account_id
