SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DD') AS date,
  COUNT(DISTINCT blockchain) AS daily
FROM
  mt_intents_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
GROUP BY
  date
ORDER BY
  date DESC
LIMIT
  ${limit}
