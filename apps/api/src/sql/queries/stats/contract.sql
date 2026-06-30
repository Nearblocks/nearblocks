SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  contracts::INT AS new_contracts
FROM
  contract_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
