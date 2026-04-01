SELECT
  COUNT(*)::TEXT AS count
FROM
  receipts r
WHERE
  (
    r.predecessor_account_id = ${predecessor}
    OR r.receiver_account_id = ${receiver}
  )
  AND r.included_in_block_timestamp >= ${start}::BIGINT
  AND r.included_in_block_timestamp <= ${end}::BIGINT
  AND (
    ${before}::BIGINT IS NULL
    OR r.included_in_block_timestamp < ${before}
  )
  AND EXISTS (
    SELECT
      1
    FROM
      action_receipt_actions a
    WHERE
      a.receipt_id = r.receipt_id
      AND a.receipt_included_in_block_timestamp = r.included_in_block_timestamp
      AND (
        ${action}::TEXT IS NULL
        OR a.action_kind = ${action}
      )
      AND (
        ${method}::TEXT IS NULL
        OR a.method = ${method}
      )
  )
