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
  COALESCE(SUM(COALESCE(s.volume_usd, 0)), 0) AS volume_usd,
  COALESCE(SUM(s.swaps), 0) AS swaps,
  COUNT(DISTINCT s.token_id) AS tokens,
  COUNT(DISTINCT s.blockchain) AS blockchains,
  COALESCE(
    SUM(COALESCE(s.volume_usd, 0)) FILTER (
      WHERE
        s.date = (
          SELECT
            date
          FROM
            prev_day
        )
    ),
    0
  ) AS prev_day_volume_usd,
  COALESCE(
    SUM(s.swaps) FILTER (
      WHERE
        s.date = (
          SELECT
            date
          FROM
            prev_day
        )
    ),
    0
  ) AS prev_day_swaps,
  COUNT(DISTINCT s.token_id) FILTER (
    WHERE
      s.date = (
        SELECT
          date
        FROM
          prev_day
      )
  ) AS prev_day_tokens,
  COUNT(DISTINCT s.blockchain) FILTER (
    WHERE
      s.date = (
        SELECT
          date
        FROM
          prev_day
      )
  ) AS prev_day_blockchains,
  COALESCE(
    (
      SELECT
        a.accounts
      FROM
        mt_intents_account_stats a
      WHERE
        a.date = (
          SELECT
            date
          FROM
            prev_day
        )
    ),
    0
  )::TEXT AS prev_day_accounts,
  (
    SELECT
      COUNT(DISTINCT account_id)
    FROM
      mt_intents_accounts
    WHERE
      date > (
        EXTRACT(
          EPOCH
          FROM
            DATE_TRUNC('day', NOW())
        ) * 1000
      )::BIGINT - 30::BIGINT * 86400000
  ) AS accounts_30d
FROM
  mt_intents_stats s
