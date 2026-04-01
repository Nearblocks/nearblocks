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
        AND token_id = %L
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )
        AND (cause = ''BURN'' OR delta_amount >= 0)',
      ${contract},
      ${token},
      ${before},
      ${before}
    )
  )
