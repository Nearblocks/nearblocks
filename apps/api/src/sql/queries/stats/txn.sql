SELECT
  TO_CHAR(TO_TIMESTAMP(t.date / 1e9), 'YYYY-MM-DD') AS date,
  t.txns::INT AS txns,
  r.receipts::TEXT AS receipts,
  ((t.tokens_burnt + o.tokens_burnt) / 1e24::NUMERIC)::TEXT AS txn_fee,
  (a.deposit / 1e24::NUMERIC)::TEXT AS txn_volume,
  a.meta_txns::INT AS meta_txns
FROM
  transaction_stats t
  LEFT JOIN outcome_stats o ON o.date = t.date
  LEFT JOIN action_stats a ON a.date = t.date
  LEFT JOIN receipt_stats r ON r.date = t.date
WHERE
  (
    ${date}::BIGINT IS NULL
    OR t.date = ${date}::BIGINT
  )
ORDER BY
  t.date DESC
LIMIT
  ${limit}
