SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  contract,
  transfers_count::TEXT,
  unique_receivers::TEXT,
  unique_senders::TEXT
FROM
  ft_contract_stats
WHERE
  contract = ${contract}
  AND date >= ${start}
ORDER BY
  date DESC
