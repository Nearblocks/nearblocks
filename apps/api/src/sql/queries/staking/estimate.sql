SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        account
      FROM
        staking_events
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${before},
      ${before}
    )
  )
