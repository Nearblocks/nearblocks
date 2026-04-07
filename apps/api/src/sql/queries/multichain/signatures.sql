WITH
  signatures_selected AS (
    WITH
      params AS (
        SELECT
          ${cursor.timestamp}::BIGINT AS block_timestamp,
          ${cursor.index}::INTEGER AS event_index
      )
    SELECT
      ms.account_id,
      ms.block_timestamp,
      ms.event_index,
      ms.public_key,
      ms.receipt_id,
      ms.tx_address,
      ms.tx_chain,
      ms.tx_hash
    FROM
      signatures ms
      JOIN params p ON TRUE
    WHERE
      (
        p.block_timestamp IS NULL
        OR (
          (
            ${direction} = 'desc'
            AND (ms.block_timestamp, ms.event_index) < (p.block_timestamp, p.event_index)
          )
          OR (
            ${direction} = 'asc'
            AND (ms.block_timestamp, ms.event_index) > (p.block_timestamp, p.event_index)
          )
        )
      )
      AND (
        ${start}::BIGINT IS NULL
        OR ms.block_timestamp >= ${start}
      )
      AND (
        ${end}::BIGINT IS NULL
        OR ms.block_timestamp <= ${end}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR ms.block_timestamp < ${before}
      )
      AND (
        ${account}::TEXT IS NULL
        OR ms.account_id = ${account}
      )
      AND (
        ${chain}::TEXT IS NULL
        OR ms.tx_chain = ${chain}
      )
      AND (
        ${address}::TEXT IS NULL
        OR ms.tx_address = ${address}
      )
      AND (
        ${txn}::TEXT IS NULL
        OR ms.tx_hash = ${txn}
      )
    ORDER BY
      block_timestamp ${direction:raw},
      event_index ${direction:raw}
    LIMIT
      ${limit}
  )
SELECT
  ss.account_id,
  ss.block_timestamp,
  ss.event_index,
  ss.public_key,
  ss.receipt_id,
  ss.tx_address AS dest_address,
  ss.tx_chain AS dest_chain,
  ss.tx_hash AS dest_txn
FROM
  signatures_selected ss
ORDER BY
  ss.block_timestamp ${direction:raw},
  ss.event_index ${direction:raw}
