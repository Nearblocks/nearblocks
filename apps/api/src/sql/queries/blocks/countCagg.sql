SELECT
  COALESCE(SUM(blocks), 0)::TEXT AS count
FROM
  block_stats
