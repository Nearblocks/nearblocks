-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  CASE
    WHEN ${before}::BIGINT IS NULL THEN approximate_row_count ('transactions')::TEXT
    ELSE (
      SELECT
        LEAST(COUNT(*), ${cap})::TEXT
      FROM
        (
          SELECT
            1
          FROM
            transactions
          WHERE
            block_timestamp < ${before}
          LIMIT
            ${cap} + 1
        ) sub
    )
  END AS count,
  '0'::TEXT AS cost
