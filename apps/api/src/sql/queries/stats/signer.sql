SELECT
  TO_CHAR(TO_TIMESTAMP(t.date / 1e9), 'YYYY-MM-DD') AS date,
  t.txns::INT AS txns,
  t.signers::INT AS signers,
  g.gas_burnt
FROM
  signer_txn_stats t
  LEFT JOIN signer_gas_stats g ON g.date = t.date
WHERE
  (
    ${date}::BIGINT IS NULL
    OR t.date = ${date}::BIGINT
  )
ORDER BY
  t.date DESC
LIMIT
  ${limit}
