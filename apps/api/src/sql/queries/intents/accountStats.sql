SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DD') AS date,
  accounts::TEXT AS daily
FROM
  mt_intents_account_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
