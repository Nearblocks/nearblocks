SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      transactions
    WHERE
      (
        signer_account_id = ${signer}
        OR receiver_account_id = ${receiver}
      )
      AND block_timestamp >= ${start}::BIGINT
      AND block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
    LIMIT
      ${limit}::INT
  ) t
