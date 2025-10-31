SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        affected_account_id
      FROM
        nft_events ne
      WHERE
        affected_account_id = %L
        AND (
          %L::TEXT IS NULL
          OR contract_account_id = %L
        )
        AND (
          %L::TEXT IS NULL
          OR token_id = %L
        )
        AND (
          %L::TEXT IS NULL
          OR involved_account_id = %L
        )
        AND (
          %L::TEXT IS NULL
          OR cause = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp > %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${account},
      ${contract},
      ${contract},
      ${token},
      ${token},
      ${involved},
      ${involved},
      ${cause},
      ${cause},
      ${after},
      ${after},
      ${before},
      ${before}
    )
  )
