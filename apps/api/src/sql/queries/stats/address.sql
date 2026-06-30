SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  accounts::INT AS active_accounts,
  contracts::INT AS active_contracts,
  meta_accounts::INT AS meta_accounts,
  meta_relayers::INT AS meta_relayers
FROM
  action_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
