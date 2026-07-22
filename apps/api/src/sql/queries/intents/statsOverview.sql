WITH
  prev_day AS (
    SELECT
      date
    FROM
      mt_intents_stats
    WHERE
      date < (
        EXTRACT(
          EPOCH
          FROM
            DATE_TRUNC('day', NOW())
        ) * 1000
      )::BIGINT
    ORDER BY
      date DESC
    LIMIT
      1
  )
SELECT
  SUM(COALESCE(s.volume_usd, 0)) AS volume_usd,
  SUM(s.swaps) AS swaps,
  COUNT(DISTINCT s.token_id) AS tokens,
  COUNT(DISTINCT s.blockchain) AS blockchains,
  SUM(COALESCE(s.volume_usd, 0)) FILTER (
    WHERE
      s.date = (
        SELECT
          date
        FROM
          prev_day
      )
  ) AS prev_day_volume_usd,
  SUM(s.swaps) FILTER (
    WHERE
      s.date = (
        SELECT
          date
        FROM
          prev_day
      )
  ) AS prev_day_swaps
FROM
  mt_intents_stats s
