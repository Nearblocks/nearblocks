SELECT
  (
    SELECT
      COALESCE(SUM(blocks), 0)::INTEGER
    FROM
      block_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000 -- 24h in ns
  ) AS blocks,
  (
    SELECT
      COALESCE(AVG(gas_price), 0)::TEXT
    FROM
      block_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000
  ) AS gas_price,
  (
    SELECT
      COALESCE(SUM(gas_used), 0)::TEXT
    FROM
      chunk_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000
  ) AS gas_used,
  (
    SELECT
      COALESCE(SUM(gas_limit), 0)::TEXT
    FROM
      chunk_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000
  ) AS gas_limit,
  (
    SELECT
      COALESCE(SUM(tokens_burnt), 0)::TEXT
    FROM
      outcome_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000
  ) AS tokens_burnt
