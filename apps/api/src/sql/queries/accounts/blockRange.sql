SELECT
  MIN(block_timestamp)::TEXT AS start_ts,
  MAX(block_timestamp)::TEXT AS end_ts
FROM
  blocks
WHERE
  block_height BETWEEN ${block_start}::BIGINT AND ${block_end}::BIGINT
