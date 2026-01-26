WITH
  active_days AS (
    SELECT
      (date / 86400000000000)::BIGINT AS day_index,
      txns
    FROM
      account_receipt_stats
    WHERE
      account = ${account}
      AND txns > 0
  ),
  base_stats AS (
    SELECT
      MIN(day_index) AS min_day,
      MAX(day_index) AS max_day,
      COUNT(*)::TEXT AS unique_days,
      SUM(txns) AS total_txns
    FROM
      active_days
  ),
  numbered_days AS (
    SELECT
      day_index,
      ROW_NUMBER() OVER (
        ORDER BY
          day_index
      ) AS rn
    FROM
      active_days
  ),
  streak_groups AS (
    SELECT
      (day_index - rn) AS streak_group,
      day_index
    FROM
      numbered_days
  ),
  streak_ranges AS (
    SELECT
      COUNT(*) AS streak_len,
      MIN(day_index) AS streak_start_idx,
      MAX(day_index) AS streak_end_idx
    FROM
      streak_groups
    GROUP BY
      streak_group
  ),
  longest_streak AS (
    SELECT
      *
    FROM
      streak_ranges
    ORDER BY
      streak_len DESC,
      streak_start_idx ASC
    LIMIT
      1
  )
SELECT
  TO_CHAR(TO_TIMESTAMP(b.min_day * 86400), 'YYYY-MM-DD') AS first_day,
  TO_CHAR(TO_TIMESTAMP(b.max_day * 86400), 'YYYY-MM-DD') AS last_day,
  COALESCE(b.total_txns, 0)::TEXT AS txns,
  COALESCE((b.max_day - b.min_day + 1), 0)::TEXT AS active_days,
  b.unique_days,
  JSON_BUILD_OBJECT(
    'days',
    COALESCE(l.streak_len, 0)::TEXT,
    'start',
    TO_CHAR(
      TO_TIMESTAMP(l.streak_start_idx * 86400),
      'YYYY-MM-DD'
    ),
    'end',
    TO_CHAR(
      TO_TIMESTAMP(l.streak_end_idx * 86400),
      'YYYY-MM-DD'
    )
  ) AS longest_streak
FROM
  base_stats b
  LEFT JOIN longest_streak l ON true;
