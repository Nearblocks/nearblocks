SELECT
  COALESCE(SUM(transfers), 0)::TEXT AS count
FROM
  account_ft_stats
WHERE
  account = ${account}
