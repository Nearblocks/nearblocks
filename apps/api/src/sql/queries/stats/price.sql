SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  near_price,
  near_btc_price,
  market_cap
FROM
  daily_stats
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
