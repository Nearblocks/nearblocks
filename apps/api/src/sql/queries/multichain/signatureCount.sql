SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        ms.account_id
      FROM
        multichain_signatures ms
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )
        AND (
          %L::TEXT IS NULL
          OR ms.account_id = %L
        )',
      ${before},
      ${before},
      ${account},
      ${account}
    )
  )
