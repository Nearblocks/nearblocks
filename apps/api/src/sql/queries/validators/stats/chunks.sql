SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  author,
  chunks
FROM
  validator_chunk_stats
WHERE
  author = ${account}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
