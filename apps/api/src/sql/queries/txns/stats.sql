SELECT
  (
    SELECT
      COALESCE(SUM(txns), 0)::INTEGER
    FROM
      transaction_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000 -- 24h in ns
  ) AS txns,
  (
    SELECT
      COALESCE(MAX(minute_txns) / 60.0, 0)
    FROM
      (
        SELECT
          SUM(txns) AS minute_txns
        FROM
          tps_stats
        WHERE
          date >= epoch_nano_seconds () - 86400000000000
        GROUP BY
          date
      ) sub
  ) AS peak_tps,
  (
    SELECT
      COALESCE(SUM(tokens_burnt), 0)::TEXT
    FROM
      outcome_stats_hourly
    WHERE
      date >= epoch_nano_seconds () - 86400000000000
  ) AS tokens_burnt,
  (
    CASE
      WHEN COALESCE(
        (
          SELECT
            SUM(txns)
          FROM
            transaction_stats_hourly
          WHERE
            date >= epoch_nano_seconds () - 86400000000000
        ),
        0
      ) = 0 THEN '0'
      ELSE (
        COALESCE(
          (
            SELECT
              SUM(tokens_burnt)
            FROM
              outcome_stats_hourly
            WHERE
              date >= epoch_nano_seconds () - 86400000000000
          ),
          0
        ) / (
          SELECT
            SUM(txns)
          FROM
            transaction_stats_hourly
          WHERE
            date >= epoch_nano_seconds () - 86400000000000
        )
      )::TEXT
    END
  ) AS avg_gas_fee
