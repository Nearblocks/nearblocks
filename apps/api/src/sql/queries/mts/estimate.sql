SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        affected_account_id
      FROM
        mt_events
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${before},
      ${before}
    )
  )
