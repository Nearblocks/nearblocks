SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      ft_events fe
    WHERE
      fe.block_timestamp >= ${start}::BIGINT
      AND fe.block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR fe.block_timestamp < ${before}
      )
      AND (
        fe.cause = 'BURN'
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
