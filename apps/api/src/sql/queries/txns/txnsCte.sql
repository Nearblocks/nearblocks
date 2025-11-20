txns_selected AS (
  WITH
    params AS (
      SELECT
        ${cursor.timestamp}::BIGINT AS block_timestamp,
        ${cursor.shard}::SMALLINT AS shard_id,
        ${cursor.index}::INTEGER AS index_in_chunk
    )
  SELECT
    t.block_timestamp,
    t.shard_id,
    t.index_in_chunk,
    t.transaction_hash,
    t.receiver_account_id,
    t.signer_account_id,
    t.included_in_block_hash,
    t.converted_into_receipt_id,
    t.receipt_conversion_tokens_burnt,
    t.receipt_conversion_gas_burnt
  FROM
    transactions t
    JOIN params p ON TRUE
  WHERE
    (
      p.block_timestamp IS NULL
      OR (
        (
          ${direction} = 'desc'
          AND (t.block_timestamp, t.shard_id, t.index_in_chunk) < (p.block_timestamp, p.shard_id, p.index_in_chunk)
        )
        OR (
          ${direction} = 'asc'
          AND (t.block_timestamp, t.shard_id, t.index_in_chunk) > (p.block_timestamp, p.shard_id, p.index_in_chunk)
        )
      )
    )
    AND (
      ${start}::BIGINT IS NULL
      OR t.block_timestamp >= ${start}
    )
    AND (
      ${end}::BIGINT IS NULL
      OR t.block_timestamp <= ${end}
    )
    AND (
      ${before}::BIGINT IS NULL
      OR t.block_timestamp < ${before}
    )
    AND (
      ${block}::TEXT IS NULL
      OR t.included_in_block_hash = ${block}
    )
  ORDER BY
    t.block_timestamp ${direction:raw},
    t.shard_id ${direction:raw},
    t.index_in_chunk ${direction:raw}
  LIMIT
    ${limit}
)
