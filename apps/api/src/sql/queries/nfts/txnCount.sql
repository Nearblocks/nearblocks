SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      nft_events ne
    WHERE
      block_timestamp >= ${start}::BIGINT
      AND block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR block_timestamp < ${before}
      )
      AND (
        cause = 'BURN'
        OR delta_amount >= 0
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
