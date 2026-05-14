-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
FROM
  (
    SELECT
      1
    FROM
      mt_events
    WHERE
      ${before}::BIGINT IS NULL
      OR block_timestamp < ${before}
    LIMIT
      ${cap} + 1
  ) sub
