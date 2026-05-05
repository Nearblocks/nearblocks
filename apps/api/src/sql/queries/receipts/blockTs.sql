SELECT
  block_timestamp
FROM
  blocks
WHERE
  block_hash = ${block}
LIMIT
  1
