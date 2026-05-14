SELECT
  COALESCE(SUM(receipts), 0)::TEXT AS count
FROM
  receipt_stats
