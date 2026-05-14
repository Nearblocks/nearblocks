-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  LEAST(COUNT(*), ${cap})::TEXT AS count,
  '0'::TEXT AS cost
FROM
  (
    (
      SELECT
        1
      FROM
        transactions
      WHERE
        signer_account_id = ${signer}
        AND (
          ${before}::BIGINT IS NULL
          OR block_timestamp < ${before}
        )
      LIMIT
        ${cap} + 1
    )
    UNION ALL
    (
      SELECT
        1
      FROM
        transactions
      WHERE
        receiver_account_id = ${receiver}
        AND signer_account_id <> ${signer}
        AND (
          ${before}::BIGINT IS NULL
          OR block_timestamp < ${before}
        )
      LIMIT
        ${cap} + 1
    )
    LIMIT
      ${cap} + 1
  ) sub
