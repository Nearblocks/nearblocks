SELECT
  COALESCE(SUM(transfers), 0)::TEXT AS count
FROM
  ft_account_stats
WHERE
  account = ${account}
  AND contract = ${contract}
