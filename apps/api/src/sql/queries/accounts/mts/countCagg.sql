SELECT
  COALESCE(SUM(transfers), 0)::TEXT AS count
FROM
  account_mt_stats
WHERE
  account = ${account}
