receipts_selected AS (
  WITH
    params AS (
      SELECT
        ${cursor.timestamp}::BIGINT AS included_in_block_timestamp,
        ${cursor.shard}::SMALLINT AS shard_id,
        ${cursor.index}::INTEGER AS index_in_chunk
    ),
    matched AS (
      (
        SELECT DISTINCT
          ON (
            a.receipt_included_in_block_timestamp,
            a.shard_id,
            a.index_in_chunk
          ) a.receipt_id,
          a.receipt_included_in_block_timestamp,
          a.shard_id,
          a.index_in_chunk
        FROM
          action_receipt_actions a
          JOIN params p ON TRUE
        WHERE
          a.receipt_predecessor_account_id = ${predecessor}
          AND (
            ${method}::TEXT IS NULL
            OR a.method = ${method}
          )
          AND (
            p.included_in_block_timestamp IS NULL
            OR (
              (
                ${direction} = 'desc'
                AND (
                  a.receipt_included_in_block_timestamp,
                  a.shard_id,
                  a.index_in_chunk
                ) < (
                  p.included_in_block_timestamp,
                  p.shard_id,
                  p.index_in_chunk
                )
              )
              OR (
                ${direction} = 'asc'
                AND (
                  a.receipt_included_in_block_timestamp,
                  a.shard_id,
                  a.index_in_chunk
                ) > (
                  p.included_in_block_timestamp,
                  p.shard_id,
                  p.index_in_chunk
                )
              )
            )
          )
          AND (
            ${start}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp >= ${start}
          )
          AND (
            ${end}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp <= ${end}
          )
          AND (
            ${before}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp < ${before}
          )
        ORDER BY
          a.receipt_included_in_block_timestamp ${direction:raw},
          a.shard_id ${direction:raw},
          a.index_in_chunk ${direction:raw}
        LIMIT
          ${limit}
      )
      UNION
      (
        SELECT DISTINCT
          ON (
            a.receipt_included_in_block_timestamp,
            a.shard_id,
            a.index_in_chunk
          ) a.receipt_id,
          a.receipt_included_in_block_timestamp,
          a.shard_id,
          a.index_in_chunk
        FROM
          action_receipt_actions a
          JOIN params p ON TRUE
        WHERE
          a.receipt_receiver_account_id = ${receiver}
          AND (
            ${method}::TEXT IS NULL
            OR a.method = ${method}
          )
          AND (
            p.included_in_block_timestamp IS NULL
            OR (
              (
                ${direction} = 'desc'
                AND (
                  a.receipt_included_in_block_timestamp,
                  a.shard_id,
                  a.index_in_chunk
                ) < (
                  p.included_in_block_timestamp,
                  p.shard_id,
                  p.index_in_chunk
                )
              )
              OR (
                ${direction} = 'asc'
                AND (
                  a.receipt_included_in_block_timestamp,
                  a.shard_id,
                  a.index_in_chunk
                ) > (
                  p.included_in_block_timestamp,
                  p.shard_id,
                  p.index_in_chunk
                )
              )
            )
          )
          AND (
            ${start}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp >= ${start}
          )
          AND (
            ${end}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp <= ${end}
          )
          AND (
            ${before}::BIGINT IS NULL
            OR a.receipt_included_in_block_timestamp < ${before}
          )
        ORDER BY
          a.receipt_included_in_block_timestamp ${direction:raw},
          a.shard_id ${direction:raw},
          a.index_in_chunk ${direction:raw}
        LIMIT
          ${limit}
      )
    )
  SELECT
    m.receipt_included_in_block_timestamp AS included_in_block_timestamp,
    m.shard_id,
    m.index_in_chunk,
    m.receipt_id,
    r.receiver_account_id,
    r.predecessor_account_id,
    r.included_in_block_hash,
    r.originated_from_transaction_hash
  FROM
    matched m
    JOIN receipts r ON r.receipt_id = m.receipt_id
    AND r.included_in_block_timestamp = m.receipt_included_in_block_timestamp
  ORDER BY
    m.receipt_included_in_block_timestamp ${direction:raw},
    m.shard_id ${direction:raw},
    m.index_in_chunk ${direction:raw}
)
