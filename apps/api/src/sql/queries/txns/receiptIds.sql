SELECT
  r.receipt_id,
  r.included_in_block_timestamp AS block_timestamp
FROM
  receipts r
WHERE
  r.originated_from_transaction_hash = ${transaction_hash}
  AND r.included_in_block_timestamp >= ${block_timestamp}::BIGINT
  AND r.included_in_block_timestamp <= ${block_timestamp}::BIGINT + 300000000000 -- 5m in ns
