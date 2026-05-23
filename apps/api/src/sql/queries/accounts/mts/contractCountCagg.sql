SELECT
  COALESCE(SUM(total_transfers), 0)::TEXT AS count
FROM
  mt_account_stats
WHERE
  account = ${account}
  AND contract = ${contract}
  AND (
    ${token}::TEXT IS NULL
    OR token = ${token}
  )
