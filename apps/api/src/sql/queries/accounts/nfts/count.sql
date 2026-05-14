SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      nft_events ne
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
          nft_meta nm
        WHERE
          nm.contract = ne.contract_account_id
          AND nm.modified_at IS NOT NULL
      )
      AND EXISTS (
        SELECT
          1
        FROM
          nft_token_meta ntm
        WHERE
          ntm.contract = ne.contract_account_id
          AND ntm.token = ne.token_id
          AND ntm.modified_at IS NOT NULL
      )
    LIMIT
      ${limit}::INT
  ) t
