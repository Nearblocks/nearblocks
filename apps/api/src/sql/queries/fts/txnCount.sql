SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        block_timestamp
      FROM
        ft_events
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${before},
      ${before}
    )
  )
