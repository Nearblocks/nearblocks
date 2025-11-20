WITH
  params AS (
    SELECT
      ${cursor.timestamp}::BIGINT AS block_timestamp,
      ${cursor.shard}::SMALLINT AS shard_id,
      ${cursor.index}::INTEGER AS event_index
  )
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
  JOIN params p ON TRUE
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
  (
    p.block_timestamp IS NULL
    OR (
      (
        ${direction} = 'desc'
        AND (
          nft.block_timestamp,
          nft.shard_id,
          nft.event_index
        ) < (p.block_timestamp, p.shard_id, p.event_index)
      )
      OR (
        ${direction} = 'asc'
        AND (
          nft.block_timestamp,
          nft.shard_id,
          nft.event_index
        ) > (p.block_timestamp, p.shard_id, p.event_index)
      )
    )
  )
  AND (
    ${start}::BIGINT IS NULL
    OR nft.block_timestamp >= ${start}
  )
  AND (
    ${end}::BIGINT IS NULL
    OR nft.block_timestamp <= ${end}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR nft.block_timestamp < ${before}
  )
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
LIMIT
  ${limit}
