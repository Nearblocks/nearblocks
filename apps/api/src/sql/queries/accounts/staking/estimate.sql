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
        account = %L
        AND (
          %L::TEXT IS NULL
          OR contract = %L
        )
        AND (
          %L::TEXT IS NULL
          OR type = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${account},
      ${contract},
      ${contract},
      ${type},
      ${type},
      ${before},
      ${before}
    )
  )
