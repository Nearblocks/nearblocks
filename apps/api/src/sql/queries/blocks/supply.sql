SELECT
  block_timestamp,
  total_supply
FROM
  blocks
ORDER BY
  block_timestamp DESC
LIMIT
  1
