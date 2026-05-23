SELECT
  COALESCE(SUM(transfers_count), 0)::TEXT AS count
FROM
  nft_contract_stats
WHERE
  contract = ${contract}
