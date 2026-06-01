SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  contract,
  token,
  transfers_count::TEXT,
  transfers_amount::TEXT,
  unique_receivers::TEXT,
  unique_senders::TEXT,
  unique_accounts::TEXT
FROM
  mt_token_stats
WHERE
  contract = ${contract}
  AND token = ${token}
  AND EXISTS (
    SELECT
      1
    FROM
      mt_base_meta
    WHERE
      contract = ${contract}
      AND token = ${token}
      AND decimals IS NOT NULL
  )
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
