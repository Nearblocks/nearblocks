-- LIMIT-and-cap: exact count when total <= 10000, otherwise 10000.
-- Cost > maxQueryCost (400000) short-circuits the service's rolling-window fallback.
-- signatures is a TimescaleDB hypertable with (account_id, block_timestamp DESC) index.
SELECT
  LEAST(COUNT(*), 10000)::TEXT AS count,
  '500000'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      signatures
    WHERE
      (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
      AND (
        ${account}::TEXT IS NULL
        OR account_id = ${account}
      )
      AND (
        ${chain}::TEXT IS NULL
        OR tx_chain = ${chain}
      )
      AND (
        ${address}::TEXT IS NULL
        OR tx_address = ${address}
      )
      AND (
        ${txn}::TEXT IS NULL
        OR tx_hash = ${txn}
      )
    LIMIT
      10001
  ) sub
