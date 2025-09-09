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
          %L::BIGINT IS NULL
          OR affected_account_id = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR involved_account_id = %L
        )
        AND EXISTS (
          SELECT
            1
          FROM
            ft_meta fm
          WHERE
            fm.contract = %L
        )',
      ${contract},
      ${affected},
      ${affected},
      ${involved},
      ${involved},
      ${contract}
    )
  )
