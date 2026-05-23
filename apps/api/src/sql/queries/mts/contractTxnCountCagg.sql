SELECT
  COALESCE(SUM(transfers_count), 0)::TEXT AS count
FROM
  mt_contract_stats
WHERE
  contract = ${contract}
