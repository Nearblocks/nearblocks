SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  contracts,
  transfers,
  unique_address_out,
  unique_address_in
FROM
  account_ft_stats
WHERE
  account = ${account}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
