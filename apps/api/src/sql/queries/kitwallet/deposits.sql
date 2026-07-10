SELECT
  SUM(
    CASE
      WHEN type = 'DEPOSIT' THEN amount
      ELSE - amount
    END
  )::TEXT AS deposit,
  contract AS validator_id
FROM
  staking_events
WHERE
  account = ${account}
  AND type IN ('DEPOSIT', 'WITHDRAW')
GROUP BY
  contract
HAVING
  COUNT(*) FILTER (
    WHERE
      type = 'DEPOSIT'
  ) > 0
ORDER BY
  contract
