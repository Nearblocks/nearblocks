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
        contract_account_id = %L
        AND (
          %L::TEXT IS NULL
          OR affected_account_id = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${contract},
      ${affected},
      ${affected},
      ${before},
      ${before}
    )
  )
