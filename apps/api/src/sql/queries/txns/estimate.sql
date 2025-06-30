SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        block_timestamp
      FROM
        transactions
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp >= %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp <= %L
        )',
      ${after},
      ${after},
      ${before},
      ${before}
    )
  )
