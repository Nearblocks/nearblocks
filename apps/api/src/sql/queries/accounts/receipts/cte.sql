receipts_selected AS (
  WITH
    params AS (
      SELECT
        ${cursor.timestamp}::BIGINT AS included_in_block_timestamp,
        ${cursor.shard}::SMALLINT AS shard_id,
        ${cursor.index}::INTEGER AS index_in_chunk
    )
  SELECT
    r.included_in_block_timestamp,
    r.shard_id,
    r.index_in_chunk,
    r.receipt_id,
    r.receiver_account_id,
    r.predecessor_account_id,
    r.included_in_block_hash,
    r.originated_from_transaction_hash
  FROM
    receipts r
    JOIN params p ON TRUE
  WHERE
    r.predecessor_account_id = ${predecessor}
    AND r.receiver_account_id = ${receiver}
    AND (
      p.included_in_block_timestamp IS NULL
      OR (
        (
          ${direction} = 'desc'
          AND (
            r.included_in_block_timestamp,
            r.shard_id,
            r.index_in_chunk
          ) < (
            p.included_in_block_timestamp,
            p.shard_id,
            p.index_in_chunk
          )
        )
        OR (
          ${direction} = 'asc'
          AND (
            r.included_in_block_timestamp,
            r.shard_id,
            r.index_in_chunk
          ) > (p.block_timestamp, p.shard_id, p.index_in_chunk)
        )
      )
    )
    AND (
      ${start}::BIGINT IS NULL
      OR r.included_in_block_timestamp >= ${start}
    )
    AND (
      ${end}::BIGINT IS NULL
      OR r.included_in_block_timestamp <= ${end}
    )
    AND (
      ${before}::BIGINT IS NULL
      OR r.included_in_block_timestamp < ${before}
    )
    AND (
      COALESCE(${action}::text, ${method}::text) IS NULL
      OR EXISTS (
        SELECT
          1
        FROM
          action_receipt_actions a
        WHERE
          a.receipt_id = r.receipt_id
          AND a.receipt_included_in_block_timestamp = r.included_in_block_timestamp
          AND (
            ${action}::text IS NULL
            OR a.action_kind = ${action}
          )
          AND (
            ${method}::text IS NULL
            OR a.method = ${method}
          )
      )
    )
  ORDER BY
    r.included_in_block_timestamp ${direction:raw},
    r.shard_id ${direction:raw},
    r.index_in_chunk ${direction:raw}
  LIMIT
    ${limit}
)
