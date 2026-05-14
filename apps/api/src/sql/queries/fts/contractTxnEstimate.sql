-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      ft_events
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
      ${cap} + 1
  ) sub
