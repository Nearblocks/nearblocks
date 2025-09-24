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
  nft.delta_amount,
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
  affected_account_id = ${account}
  AND (
    ${contract}::TEXT IS NULL
    OR nft.contract_account_id = ${contract}
  )
  AND (
    p.block_timestamp IS NULL
    OR (
      nft.block_timestamp,
      nft.shard_id,
      nft.event_index
    ) < (p.block_timestamp, p.shard_id, p.event_index)
  )
  AND (
    ${after}::BIGINT IS NULL
    OR nft.block_timestamp > ${after}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR nft.block_timestamp < ${before}
  )
  AND (
    ${token}::TEXT IS NULL
    OR nft.token_id = ${token}
  )
  AND (
    ${involved}::TEXT IS NULL
    OR nft.involved_account_id = ${involved}
  )
  AND (
    ${cause}::TEXT IS NULL
    OR nft.cause = ${cause}
  )
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
LIMIT
  ${limit}
