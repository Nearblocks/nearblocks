-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      nft_events
    WHERE
      affected_account_id = ${account}
      AND (
        ${contract}::TEXT IS NULL
        OR contract_account_id = ${contract}
      )
      AND (
        ${token}::TEXT IS NULL
        OR token_id = ${token}
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
      ${cap} + 1
  ) sub
