SELECT
  count,
  cost
FROM
  count_cost_estimate ('SELECT block_timestamp FROM ft_events')
