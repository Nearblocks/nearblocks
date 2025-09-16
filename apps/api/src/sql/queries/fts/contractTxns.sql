WITH
  params AS (
    SELECT
      ${cursor.timestamp}::BIGINT AS block_timestamp,
      ${cursor.shard}::SMALLINT AS shard_id,
      ${cursor.type}::SMALLINT AS event_type,
      ${cursor.index}::INTEGER AS event_index
  )
SELECT
  ft.block_timestamp,
  ft.shard_id,
  ft.event_type,
  ft.event_index,
  ft.receipt_id,
  ft.contract_account_id,
  ft.affected_account_id,
  ft.involved_account_id,
  ft.cause,
  ft.delta_amount,
  m.meta
FROM
  ft_events ft
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
        'decimals',
        decimals,
        'icon',
        icon,
        'reference',
        reference
      ) AS meta
    FROM
      ft_meta fm
    WHERE
      fm.contract = ft.contract_account_id
  ) m ON TRUE
WHERE
  (
    p.block_timestamp IS NULL
    OR (
      ft.block_timestamp,
      ft.shard_id,
      ft.event_type,
      ft.event_index
    ) < (
      p.block_timestamp,
      p.shard_id,
      p.event_type,
      p.event_index
    )
  )
  AND (
    ${after}::BIGINT IS NULL
    OR ft.block_timestamp > ${after}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR ft.block_timestamp < ${before}
  )
  AND ft.contract_account_id = ${contract}
  AND (
    ${affected}::TEXT IS NULL
    OR ft.affected_account_id = ${affected}
  )
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  event_type DESC,
  event_index DESC
LIMIT
  ${limit}
