SELECT
  TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date,
  author,
  blocks
FROM
  validator_block_stats
WHERE
  author = ${account}
ORDER BY
  date DESC
LIMIT
  ${limit}::INT
