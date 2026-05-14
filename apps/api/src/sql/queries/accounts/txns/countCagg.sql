SELECT
  COALESCE(SUM(txns), 0)::TEXT AS count
FROM
  account_txn_stats
WHERE
  account = ${account}
