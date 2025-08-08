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
      ms.signature,
      ms.r,
      ms.s
    FROM
      multichain_signatures ms
      JOIN params p ON TRUE
    WHERE
      (
        p.block_timestamp IS NULL
        OR (ms.block_timestamp, ms.event_index) < (p.block_timestamp, p.event_index)
      )
      AND (
        ${after}::BIGINT IS NULL
        OR ms.block_timestamp > ${after}
      )
      AND (
        ${before}::BIGINT IS NULL
        OR ms.block_timestamp < ${before}
      )
      AND (
        ${account}::TEXT IS NULL
        OR ms.account_id = ${account}
      )
    ORDER BY
      block_timestamp DESC,
      event_index DESC
    LIMIT
      ${limit}
  )
SELECT
  ss.account_id,
  ss.block_timestamp,
  ss.event_index,
  ss.public_key,
  ss.receipt_id,
  COALESCE(s.address, rs.address) AS dest_address,
  COALESCE(s.chain, rs.chain) AS dest_chain,
  COALESCE(s.transaction, rs.transaction) AS dest_txn
FROM
  signatures_selected ss
  LEFT JOIN LATERAL (
    SELECT
      mt.address,
      mt.chain,
      mt.transaction
    FROM
      multichain_transactions mt
    WHERE
      mt.signature = ss.signature
      AND mt."timestamp" >= ss.block_timestamp
      AND mt."timestamp" <= ss.block_timestamp + 3600000000000 -- 1hr in ns
  ) s ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      mt.address,
      mt.chain,
      mt.transaction
    FROM
      multichain_transactions mt
    WHERE
      mt.r = ss.r
      AND mt.s = ss.s
      AND mt."timestamp" >= ss.block_timestamp
      AND mt."timestamp" <= ss.block_timestamp + 3600000000000 -- 1hr in ns
  ) rs ON TRUE
ORDER BY
  ss.block_timestamp DESC,
  ss.event_index DESC
