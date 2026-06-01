SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  contract,
  token,
  total_transfers::TEXT AS transfers,
  received_amount::TEXT AS amount_in,
  sent_amount::TEXT AS amount_out,
  unique_address_received::TEXT AS unique_address_in,
  unique_address_sent::TEXT AS unique_address_out
FROM
  mt_account_stats
WHERE
  account = ${account}
  AND contract = ${contract}
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
