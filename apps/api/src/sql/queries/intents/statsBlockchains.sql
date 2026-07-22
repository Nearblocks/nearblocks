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
  s.blockchain,
  SUM(COALESCE(s.volume_usd, 0)) AS volume,
  SUM(s.swaps) AS swaps
FROM
  mt_intents_stats s
  JOIN days d USING (date)
GROUP BY
  s.date,
  s.blockchain
ORDER BY
  s.date DESC,
  volume DESC NULLS LAST
