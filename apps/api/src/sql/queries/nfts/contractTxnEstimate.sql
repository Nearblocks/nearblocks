-- LIMIT-and-cap: exact count when total <= 10000, otherwise 10000.
-- Cost > maxQueryCost (400000) short-circuits the service's rolling-window fallback.
-- Note: original had `${affected}::BIGINT` which would error if affected was a non-null text
-- account name. Fixed to ::TEXT here to match column type.
SELECT
  LEAST(COUNT(*), 10000)::TEXT AS count,
  '500000'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      nft_events
    WHERE
      contract_account_id = ${contract}
      AND (
        ${affected}::TEXT IS NULL
        OR affected_account_id = ${affected}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
      AND (
        ${affected}::TEXT IS NOT NULL
        OR cause = 'BURN'
        OR delta_amount >= 0
      )
    LIMIT
      10001
  ) sub
