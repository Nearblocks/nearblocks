SELECT
  count,
  cost
FROM
  count_cost_estimate (
    FORMAT(
      'SELECT
        r.included_in_block_timestamp
      FROM
        receipts r
      WHERE
        (
          r.predecessor_account_id = %L
          OR receiver_account_id = %L
        )
        AND (
          %L::BIGINT IS NULL
          OR r.included_in_block_timestamp > %L
        )
        AND (
          %L::BIGINT IS NULL
          OR r.included_in_block_timestamp < %L
        )
        AND EXISTS (
          SELECT
            1
          FROM
            action_receipt_actions a
          WHERE
            a.receipt_id = r.receipt_id
            AND a.receipt_included_in_block_timestamp = r.included_in_block_timestamp
            AND (
              %L::text IS NULL
              OR a.action_kind = %L
            )
            AND (
              %L::text IS NULL
              OR a.method = %L
            )
        )
      ',
      ${predecessor},
      ${receiver},
      ${after},
      ${after},
      ${before},
      ${before},
      ${action},
      ${action},
      ${method},
      ${method}
    )
  )
