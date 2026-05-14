-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
FROM
  (
    (
      SELECT
        1
      FROM
        receipts r
      WHERE
        r.predecessor_account_id = ${predecessor}
        AND (
          ${before}::BIGINT IS NULL
          OR r.included_in_block_timestamp < ${before}
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
              ${action}::TEXT IS NULL
              OR a.action_kind = ${action}
            )
            AND (
              ${method}::TEXT IS NULL
              OR a.method = ${method}
            )
        )
      LIMIT
        ${cap} + 1
    )
    UNION ALL
    (
      SELECT
        1
      FROM
        receipts r
      WHERE
        r.receiver_account_id = ${receiver}
        AND r.predecessor_account_id <> ${predecessor}
        AND (
          ${before}::BIGINT IS NULL
          OR r.included_in_block_timestamp < ${before}
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
              ${action}::TEXT IS NULL
              OR a.action_kind = ${action}
            )
            AND (
              ${method}::TEXT IS NULL
              OR a.method = ${method}
            )
        )
      LIMIT
        ${cap} + 1
    )
    LIMIT
      ${cap} + 1
  ) sub
