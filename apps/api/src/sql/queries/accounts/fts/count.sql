SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      ft_events fe
    WHERE
      affected_account_id = ${account}
      AND block_timestamp >= ${start}::BIGINT
      AND block_timestamp <= ${end}::BIGINT
      AND (
        ${contract}::TEXT IS NULL
        OR contract_account_id = ${contract}
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
      AND EXISTS (
        SELECT
          1
        FROM
          ft_meta fm
        WHERE
          fm.contract = fe.contract_account_id
          AND fm.modified_at IS NOT NULL
      )
    LIMIT
      ${limit}::INT
  ) t
