SELECT
  COALESCE(SUM(transfers_count), 0)::TEXT AS count
FROM
  ft_contract_stats
