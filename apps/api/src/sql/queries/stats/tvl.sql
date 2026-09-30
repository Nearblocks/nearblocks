SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DD') AS date,
  SUM(COALESCE(amount_usd, 0)) AS tvl_usd
FROM
  tvl_stats_daily
WHERE
  ${date}::BIGINT IS NULL
  OR date = ${date}::BIGINT
GROUP BY
  date
ORDER BY
  date DESC
LIMIT
  ${limit}
