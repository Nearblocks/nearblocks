SELECT
  contract AS contract_account_id
FROM
  ft_account_stats
WHERE
  account = ${account}
UNION
SELECT
  contract_account_id
FROM
  ft_events
WHERE
  affected_account_id = ${account}
  AND block_timestamp > (
    EXTRACT(
      EPOCH
      FROM
        NOW()
    )::BIGINT - 172800
  ) * 1000000000 -- 2d in ns
  AND (
    ${last}::BIGINT IS NULL
    OR block_timestamp <= ${last}
  )
