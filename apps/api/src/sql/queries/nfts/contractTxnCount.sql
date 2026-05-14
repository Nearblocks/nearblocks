SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      nft_events ne
    WHERE
      ne.contract_account_id = ${contract}
      AND ne.block_timestamp >= ${start}::BIGINT
      AND ne.block_timestamp <= ${end}::BIGINT
      AND (
        ${affected}::TEXT IS NULL
        OR ne.affected_account_id = ${affected}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR ne.block_timestamp < ${before}
      )
      AND (
        ${affected}::TEXT IS NOT NULL
        OR ne.cause = 'BURN'
        OR ne.delta_amount >= 0
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
  ) limited
