SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  account,
  txns,
  unique_address_out,
  unique_address_in
FROM
  account_receipt_stats
WHERE
  account = ${account}
  AND (
    ${start}::BIGINT IS NULL
    OR date >= ${start}
  )
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
