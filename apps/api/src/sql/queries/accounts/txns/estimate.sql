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
          signer_account_id = %L
          OR receiver_account_id = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp > %L
        )
        AND (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )',
      ${signer},
      ${receiver},
      ${after},
      ${after},
      ${before},
      ${before}
    )
  )
