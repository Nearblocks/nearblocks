SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        r.included_in_block_timestamp
      FROM
        receipts r
      WHERE
        (
          %L::BIGINT IS NULL
          OR r.included_in_block_timestamp < %L
        )
        AND (
          %L::TEXT IS NULL
          OR r.included_in_block_hash = %L
        )
      ',
      ${before},
      ${before},
      ${block},
      ${block}
    )
  )
