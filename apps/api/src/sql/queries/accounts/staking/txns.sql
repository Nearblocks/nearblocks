WITH
  params AS (
    SELECT
      ${cursor.timestamp}::BIGINT AS block_timestamp,
      ${cursor.shard}::SMALLINT AS shard_id,
      ${cursor.index}::INTEGER AS index_in_chunk
  )
SELECT
  se.block_timestamp,
  se.shard_id,
  se.index_in_chunk,
  se.receipt_id,
  se.contract,
  se.account,
  se.type,
  se.amount
FROM
  staking_events se
  JOIN params p ON TRUE
WHERE
  se.account = ${account}
  AND (
    ${contract}::TEXT IS NULL
    OR se.contract = ${contract}
  )
  AND (
    p.block_timestamp IS NULL
    OR (
      (
        ${direction} = 'desc'
        AND (
          se.block_timestamp,
          se.shard_id,
          se.index_in_chunk
        ) < (p.block_timestamp, p.shard_id, p.index_in_chunk)
      )
      OR (
        ${direction} = 'asc'
        AND (
          se.block_timestamp,
          se.shard_id,
          se.index_in_chunk
        ) > (p.block_timestamp, p.shard_id, p.index_in_chunk)
      )
    )
  )
  AND (
    ${start}::BIGINT IS NULL
    OR se.block_timestamp >= ${start}
  )
  AND (
    ${end}::BIGINT IS NULL
    OR se.block_timestamp <= ${end}
  )
  AND (
    ${before}::BIGINT IS NULL
    OR se.block_timestamp < ${before}
  )
  AND (
    ${type}::TEXT IS NULL
    OR se.type = ${type}
  )
ORDER BY
  block_timestamp ${direction:raw},
  shard_id ${direction:raw},
  index_in_chunk ${direction:raw}
LIMIT
  ${limit}
