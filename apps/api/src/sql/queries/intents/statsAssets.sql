WITH
  days AS (
    SELECT DISTINCT
      date
    FROM
      mt_intents_stats
    WHERE
      (
        ${date}::BIGINT IS NULL
        OR date = ${date}::BIGINT
      )
    ORDER BY
      date DESC
    LIMIT
      ${limit}
  )
SELECT
  TO_CHAR(TO_TIMESTAMP(s.date / 1000), 'YYYY-MM-DD') AS date,
  s.token_id,
  bm.symbol,
  s.blockchain,
  s.volume,
  s.volume_usd,
  s.swaps::TEXT AS swaps,
  s.fee_usd AS fee
FROM
  mt_intents_stats s
  JOIN days d USING (date)
  LEFT JOIN LATERAL (
    SELECT
      mbm.symbol
    FROM
      mt_base_meta mbm
    WHERE
      mbm.contract = 'intents.near'
      AND mbm.token = s.token_id
      AND mbm.modified_at IS NOT NULL
  ) bm ON TRUE
ORDER BY
  s.date DESC,
  s.volume_usd DESC NULLS LAST
