SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  contract,
  transfers::TEXT,
  amount_in::TEXT,
  amount_out::TEXT,
  unique_address_in::TEXT,
  unique_address_out::TEXT
FROM
  ft_account_stats
WHERE
  account = ${account}
  AND contract = ${contract}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
