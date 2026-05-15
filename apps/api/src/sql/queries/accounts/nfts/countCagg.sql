SELECT
  COALESCE(SUM(transfers), 0)::TEXT AS count
FROM
  account_nft_stats
WHERE
  account = ${account}
