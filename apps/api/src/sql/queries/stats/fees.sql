SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  tokens_burnt::TEXT AS fee
FROM
  outcome_stats
WHERE
  date >= ${start}::BIGINT
  AND date < ${end}::BIGINT
ORDER BY
  date DESC
