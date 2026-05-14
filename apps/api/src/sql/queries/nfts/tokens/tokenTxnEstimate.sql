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
      contract_account_id = ${contract}
      AND token_id = ${token}
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
      AND (
        cause = 'BURN'
        OR delta_amount >= 0
      )
    LIMIT
      ${cap} + 1
  ) sub
