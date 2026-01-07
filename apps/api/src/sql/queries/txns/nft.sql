SELECT
  nft.receipt_id,
  nft.contract_account_id,
  nft.affected_account_id,
  nft.involved_account_id,
  nft.token_id,
  nft.cause,
  nft.delta_amount,
  nft.block_timestamp,
  nft.shard_id,
  nft.event_index,
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
      nft_meta nfm
    WHERE
      nfm.contract = nft.contract_account_id
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
  ) tm ON TRUE
WHERE
  nft.receipt_id = ${receipt_id}::TEXT
  AND nft.block_timestamp = ${block_timestamp}::BIGINT
