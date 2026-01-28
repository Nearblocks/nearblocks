SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  COALESCE(amount_out, 0)::TEXT AS amount_out,
  COALESCE(amount_in, 0)::TEXT AS amount_in
FROM
  account_near_stats
WHERE
  account = ${account}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
