-- UNION ALL split is critical here: Postgres can't cleanly use two indexes for an OR condition
-- in one pass. The OR plan does BitmapOr+sort. UNION ALL gives two clean index range scans on
-- (signer_account_id, block_timestamp DESC) and (receiver_account_id, block_timestamp DESC),
-- each terminating at LIMIT independently. Measured 30x speedup on relay.aurora (514ms -> 17ms).
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
        transactions
      WHERE
        signer_account_id = ${signer}
        AND (
          ${before}::BIGINT IS NULL
          OR block_timestamp < ${before}
        )
      LIMIT
        10001
    )
    UNION ALL
    (
      SELECT
        1
      FROM
        transactions
      WHERE
        receiver_account_id = ${receiver}
        AND signer_account_id <> ${signer}
        AND (
          ${before}::BIGINT IS NULL
          OR block_timestamp < ${before}
        )
      LIMIT
        10001
    )
    LIMIT
      10001
  ) sub
