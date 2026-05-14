SELECT
  COALESCE(SUM(receipts), 0)::TEXT AS count
FROM
  account_receipt_stats
WHERE
  account = ${account}
