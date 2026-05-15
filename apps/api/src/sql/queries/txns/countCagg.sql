SELECT
  COALESCE(SUM(txns), 0)::TEXT AS count
FROM
  transaction_stats
