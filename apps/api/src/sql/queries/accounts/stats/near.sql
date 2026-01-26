SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  amount_out,
  amount_in
FROM
  account_near_stats
WHERE
  account = ${account}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
