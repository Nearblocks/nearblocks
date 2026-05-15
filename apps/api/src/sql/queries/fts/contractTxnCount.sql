SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      ft_events fe
    WHERE
      fe.contract_account_id = ${contract}
      AND fe.block_timestamp >= ${start}::BIGINT
      AND fe.block_timestamp <= ${end}::BIGINT
      AND (
        ${affected}::TEXT IS NULL
        OR fe.affected_account_id = ${affected}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR fe.block_timestamp < ${before}
      )
      AND (
        ${affected}::TEXT IS NOT NULL
        OR fe.cause = 'BURN'
        OR fe.delta_amount >= 0
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
  ) limited
