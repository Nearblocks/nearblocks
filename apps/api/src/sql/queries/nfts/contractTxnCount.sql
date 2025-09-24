SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        block_timestamp
      FROM
        nft_events
      WHERE
        contract_account_id = %L
        AND (
          %L::BIGINT IS NULL
          OR affected_account_id = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp > %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${contract},
      ${affected},
      ${affected},
      ${after},
      ${after},
      ${before},
      ${before}
    )
  )
