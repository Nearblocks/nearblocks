-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  CASE
    WHEN ${before}::BIGINT IS NULL
    AND ${block}::TEXT IS NULL THEN approximate_row_count ('receipts')::TEXT
    ELSE (
      SELECT
        LEAST(COUNT(*), ${cap})::TEXT
      FROM
        (
          SELECT
            1
          FROM
            receipts
          WHERE
            (
              ${before}::BIGINT IS NULL
              OR included_in_block_timestamp < ${before}
            )
            AND (
              ${block}::TEXT IS NULL
              OR included_in_block_hash = ${block}
            )
          LIMIT
            ${cap} + 1
        ) sub
    )
  END AS count,
  '0'::TEXT AS cost
