-- approximate_row_count gives exact-to-1h count on TimescaleDB hypertables; vastly more reliable
-- than count_cost_estimate which drifts ~7%+ on hypertables (chunk-stat aggregation drift).
-- When `before` is set, fall back to a capped real count (LIMIT 10001 stops scans early).
-- Cost is set above config.maxQueryCost (400000) to short-circuit the service's rolling-window
-- fallback path - the returned count is already exact (up to 10000) or accurate (approximate_row_count).
SELECT
  CASE
    WHEN ${before}::BIGINT IS NULL THEN approximate_row_count ('transactions')::TEXT
    ELSE (
      SELECT
        LEAST(COUNT(*), 10000)::TEXT
      FROM
        (
          SELECT
            1
          FROM
            transactions
          WHERE
            block_timestamp < ${before}
          LIMIT
            10001
        ) sub
    )
  END AS count,
  '500000'::TEXT AS cost
