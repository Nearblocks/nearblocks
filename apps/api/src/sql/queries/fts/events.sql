WITH
  params AS (
    SELECT
      ${cursor.timestamp}::BIGINT AS block_timestamp,
      ${cursor.shard}::INTEGER AS shard_id,
      ${cursor.type}::INTEGER AS event_type,
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
  ft.standard
FROM
  ft_events ft
  JOIN params p ON TRUE
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
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  event_type DESC,
  event_index DESC
LIMIT
  ${limit}
