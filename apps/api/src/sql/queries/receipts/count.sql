SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      receipts r
    WHERE
      r.included_in_block_timestamp >= ${start}::BIGINT
      AND r.included_in_block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR r.included_in_block_timestamp < ${before}
      )
      AND (
        ${block}::TEXT IS NULL
        OR r.included_in_block_hash = ${block}
      )
    LIMIT
      ${limit}::INT
  ) t
