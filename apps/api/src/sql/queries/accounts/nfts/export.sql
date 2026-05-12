SELECT
  nft.block_timestamp,
  nft.shard_id,
  nft.event_index,
  nft.receipt_id,
  nft.contract_account_id,
  nft.affected_account_id,
  nft.involved_account_id,
  nft.token_id,
  nft.cause,
  nft.delta_amount::TEXT,
  m.meta,
  tm.token_meta
FROM
  nft_events nft
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'name',
        name,
        'symbol',
        symbol,
        'base_uri',
        base_uri,
        'icon',
        icon,
        'reference',
        reference
      ) AS meta
    FROM
      nft_meta nm
    WHERE
      nm.contract = nft.contract_account_id
      AND nm.modified_at IS NOT NULL
  ) m ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'title',
        title,
        'media',
        media,
        'reference',
        reference
      ) AS token_meta
    FROM
      nft_token_meta ntm
    WHERE
      ntm.contract = nft.contract_account_id
      AND ntm.token = nft.token_id
      AND ntm.modified_at IS NOT NULL
  ) tm ON TRUE
WHERE
  nft.affected_account_id = ${account}
  AND nft.block_timestamp >= ${start}::BIGINT
  AND nft.block_timestamp <= ${end}::BIGINT
ORDER BY
  nft.block_timestamp ASC,
  nft.shard_id ASC,
  nft.event_index ASC
LIMIT
  5000
