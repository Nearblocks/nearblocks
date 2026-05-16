SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      mt_events mt
    WHERE
      mt.contract_account_id = ${contract}
      AND mt.block_timestamp >= ${start}::BIGINT
      AND mt.block_timestamp <= ${end}::BIGINT
      AND (
        ${affected}::TEXT IS NULL
        OR mt.affected_account_id = ${affected}
      )
      AND (
        ${token}::TEXT IS NULL
        OR mt.token_id = ${token}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR mt.block_timestamp < ${before}
      )
      AND EXISTS (
        SELECT
          1
        FROM
          mt_meta mm
        WHERE
          mm.contract = mt.contract_account_id
      )
      AND EXISTS (
        SELECT
          1
        FROM
          mt_base_meta mbm
        WHERE
          mbm.contract = mt.contract_account_id
          AND mbm.token = mt.token_id
          AND mbm.modified_at IS NOT NULL
      )
      AND EXISTS (
        SELECT
          1
        FROM
          mt_token_meta mtm
        WHERE
          mtm.contract = mt.contract_account_id
          AND mtm.token = mt.token_id
          AND mtm.modified_at IS NOT NULL
      )
    LIMIT
      ${limit}::INT
  ) t
