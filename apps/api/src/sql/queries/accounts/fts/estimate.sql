-- LIMIT-and-cap: exact count when total <= 10000, otherwise 10000.
-- Cost > maxQueryCost (400000) short-circuits the service's rolling-window fallback.
SELECT
  LEAST(COUNT(*), 10000)::TEXT AS count,
  '500000'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      ft_events
    WHERE
      affected_account_id = ${account}
      AND (
        ${contract}::TEXT IS NULL
        OR contract_account_id = ${contract}
      )
      AND (
        ${involved}::TEXT IS NULL
        OR involved_account_id = ${involved}
      )
      AND (
        ${cause}::TEXT IS NULL
        OR cause = ${cause}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
    LIMIT
      10001
  ) sub
