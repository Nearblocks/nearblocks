WITH
  daily AS (
    SELECT
      date,
      SUM(swaps) AS daily
    FROM
      mt_intents_stats
    GROUP BY
      date
  ),
  cumulative AS (
    SELECT
      date,
      daily,
      SUM(daily) OVER (
        ORDER BY
          date
      ) AS cumulative
    FROM
      daily
  )
SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DD') AS date,
  daily,
  cumulative
FROM
  cumulative
WHERE
  (
    ${date}::BIGINT IS NULL
    OR date = ${date}::BIGINT
  )
ORDER BY
  date DESC
LIMIT
  ${limit}
