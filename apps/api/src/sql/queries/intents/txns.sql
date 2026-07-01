WITH
  params AS (
    SELECT
      ${cursor.timestamp}::BIGINT AS block_timestamp,
      ${cursor.shard}::SMALLINT AS shard_id,
      ${cursor.index}::INTEGER AS event_index
  )
SELECT
  mt.block_timestamp,
  mt.shard_id,
  mt.event_index,
  mt.receipt_id,
  mt.contract_account_id,
  mt.affected_account_id,
  mt.involved_account_id,
  mt.token_id,
  mt.cause,
  mt.delta_amount::TEXT,
  m.meta,
  bm.base_meta,
  tm.token_meta,
  pr.price
FROM
  mt_events mt
  JOIN params p ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('contract', contract, 'name', name, 'spec', spec) AS meta
    FROM
      mt_meta mm
    WHERE
      mm.contract = mt.contract_account_id
  ) m ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'name',
        name,
        'symbol',
        symbol,
        'decimals',
        decimals,
        'base_uri',
        base_uri,
        'icon',
        icon,
        'reference',
        reference
      ) AS base_meta
    FROM
      mt_base_meta mbm
    WHERE
      mbm.contract = mt.contract_account_id
      AND mbm.token = mt.token_id
      AND mbm.modified_at IS NOT NULL
  ) bm ON TRUE
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
      mt_token_meta mtm
    WHERE
      mtm.contract = mt.contract_account_id
      AND mtm.token = mt.token_id
      AND mtm.modified_at IS NOT NULL
  ) tm ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      fpd.price::TEXT AS price
    FROM
      mt_intents_tokens it
      JOIN ft_prices_daily fpd ON fpd.coingecko_id = it.coingecko_id
    WHERE
      it.token = mt.token_id
      AND fpd.date <= mt.block_timestamp / 1000000
    ORDER BY
      fpd.date DESC
    LIMIT
      1
  ) pr ON TRUE
WHERE
  mt.contract_account_id = 'intents.near'
  AND (
    p.block_timestamp IS NULL
    OR (
      (
        ${direction} = 'desc'
        AND (mt.block_timestamp, mt.shard_id, mt.event_index) < (p.block_timestamp, p.shard_id, p.event_index)
      )
      OR (
        ${direction} = 'asc'
        AND (mt.block_timestamp, mt.shard_id, mt.event_index) > (p.block_timestamp, p.shard_id, p.event_index)
      )
    )
  )
  AND (
    ${start}::BIGINT IS NULL
    OR mt.block_timestamp >= ${start}
  )
  AND (
    ${end}::BIGINT IS NULL
    OR mt.block_timestamp <= ${end}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR mt.block_timestamp < ${before}
  )
ORDER BY
  block_timestamp ${direction:raw},
  shard_id ${direction:raw},
  event_index ${direction:raw}
LIMIT
  ${limit}
