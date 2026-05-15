SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      mt_events mt
    WHERE
      affected_account_id = ${account}
      AND block_timestamp >= ${start}::BIGINT
      AND block_timestamp <= ${end}::BIGINT
      AND (
        ${contract}::TEXT IS NULL
        OR contract_account_id = ${contract}
      )
      AND (
        ${token}::TEXT IS NULL
        OR token_id = ${token}
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
