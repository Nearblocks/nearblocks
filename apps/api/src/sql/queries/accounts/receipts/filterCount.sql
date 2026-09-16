WITH
  matched AS (
    SELECT DISTINCT
      ON (
        a.receipt_included_in_block_timestamp,
        a.shard_id,
        a.index_in_chunk
      ) 1
    FROM
      action_receipt_actions a
    WHERE
      a.receipt_receiver_account_id = ${receiver}
      AND a.receipt_predecessor_account_id = ${predecessor}
      AND (
        ${method}::TEXT IS NULL
        OR a.method = ${method}
      )
      AND a.receipt_included_in_block_timestamp >= ${start}::BIGINT
      AND a.receipt_included_in_block_timestamp <= ${end}::BIGINT
      AND (
        ${before}::BIGINT IS NULL
        OR a.receipt_included_in_block_timestamp < ${before}
      )
    ORDER BY
      a.receipt_included_in_block_timestamp DESC,
      a.shard_id DESC,
      a.index_in_chunk DESC
    LIMIT
      ${limit}::INT
  )
SELECT
  COUNT(*)::TEXT AS count
FROM
  matched
