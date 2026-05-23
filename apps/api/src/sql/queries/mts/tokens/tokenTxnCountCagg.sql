SELECT
  COALESCE(SUM(transfers_count), 0)::TEXT AS count
FROM
  mt_token_stats
WHERE
  contract = ${contract}
  AND token = ${token}
