SELECT
  (
    SELECT
      block_timestamp
    FROM
      blocks
    WHERE
      block_height >= ${block_start}::BIGINT
    ORDER BY
      block_height ASC
    LIMIT
      1
  )::TEXT AS start_ts,
  (
    SELECT
      block_timestamp
    FROM
      blocks
    WHERE
      block_height <= ${block_end}::BIGINT
    ORDER BY
      block_height DESC
    LIMIT
      1
  )::TEXT AS end_ts
