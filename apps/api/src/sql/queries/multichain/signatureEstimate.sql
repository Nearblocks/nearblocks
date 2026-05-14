-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
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
      ${cap} + 1
  ) sub
