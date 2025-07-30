SELECT
  ${account_id}::TEXT AS account_id,
  ${public_key}::TEXT AS public_key,
  ${dest_address}::TEXT AS dest_address,
  ${dest_chain}::TEXT AS dest_chain,
  ${dest_txn}::TEXT AS dest_txn,
  ${block_timestamp}::TEXT AS block_timestamp,
  ${event_index}::INT AS event_index,
  r.receipt_id,
  t.transaction_hash,
  JSONB_BUILD_OBJECT(
    'block_hash',
    b.block_hash,
    'block_height',
    b.block_height::TEXT,
    'block_timestamp',
    b.block_timestamp::TEXT
  ) AS block
FROM
  receipts r
  JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
  JOIN blocks b ON b.block_hash = t.included_in_block_hash
WHERE
  r.receipt_id = ${receipt_id}::TEXT
  AND r.included_in_block_timestamp = ${block_timestamp}::BIGINT
  AND t.block_timestamp <= ${block_timestamp}::BIGINT
  AND t.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000
  AND b.block_timestamp <= ${block_timestamp}::BIGINT
  AND b.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000
