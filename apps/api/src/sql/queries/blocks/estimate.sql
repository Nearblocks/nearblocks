-- approximate_row_count gives exact-to-1h count on TimescaleDB hypertables; vastly more
-- reliable than count_cost_estimate which drifts 7%+ on hypertables. The blocks count service
-- returns this row directly with no fallback path - cost is informational only.
SELECT
  approximate_row_count ('blocks')::TEXT AS count,
  '500000'::TEXT AS cost
