-- UNION ALL split avoids the BitmapOr plan from "predecessor = X OR receiver = X".
-- Each leg uses (predecessor_account_id, included_in_block_timestamp DESC) or
-- (receiver_account_id, included_in_block_timestamp DESC) cleanly, with LIMIT terminating early.
-- Cap at 10000 - frontend displays "10,000+" when LIMIT hits.
-- Cost set above config.maxQueryCost (400000) to short-circuit the service's rolling-window fallback.
SELECT
  LEAST(COUNT(*), 10000)::TEXT AS count,
  '500000'::TEXT AS cost
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
        10001
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
        10001
    )
    LIMIT
      10001
  ) sub
