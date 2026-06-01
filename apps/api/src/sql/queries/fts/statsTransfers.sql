SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  contract,
  transfers_count::TEXT,
  transfers_amount::TEXT,
  unique_receivers::TEXT,
  unique_senders::TEXT,
  unique_accounts::TEXT
FROM
  ft_contract_stats
WHERE
  contract = ${contract}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
