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
    t.receipt_conversion_tokens_burnt
  FROM
    transactions t
    JOIN params p ON TRUE
  WHERE
    t.signer_account_id = ${signer}
    AND t.receiver_account_id = ${receiver}
    AND (
      p.block_timestamp IS NULL
      OR (t.block_timestamp, t.shard_id, t.index_in_chunk) < (p.block_timestamp, p.shard_id, p.index_in_chunk)
    )
    AND (
      ${after}::BIGINT IS NULL
      OR t.block_timestamp > ${after}
    )
    AND (
      ${before}::BIGINT IS NULL
      OR t.block_timestamp < ${before}
    )
  ORDER BY
    t.block_timestamp DESC,
    t.shard_id DESC,
    t.index_in_chunk DESC
  LIMIT
    ${limit}
)
