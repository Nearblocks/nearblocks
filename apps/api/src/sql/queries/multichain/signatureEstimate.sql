SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        ms.account_id
      FROM
        signatures ms
      WHERE
        (
          %L::BIGINT IS NULL
          OR block_timestamp < %L
        )
        AND (
          %L::TEXT IS NULL
          OR ms.account_id = %L
        )
        AND (
          %L::TEXT IS NULL
          OR ms.tx_chain = %L
        )
        AND (
          %L::TEXT IS NULL
          OR ms.tx_address = %L
        )
        AND (
          %L::TEXT IS NULL
          OR ms.tx_hash = %L
        )',
      ${before},
      ${before},
      ${account},
      ${account},
      ${chain},
      ${chain},
      ${address},
      ${address},
      ${txn},
      ${txn}
    )
  )
