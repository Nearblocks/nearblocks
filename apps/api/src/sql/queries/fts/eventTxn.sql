SELECT
  ${contract_account_id}::TEXT AS contract_account_id,
  ${affected_account_id}::TEXT AS affected_account_id,
  ${involved_account_id}::TEXT AS involved_account_id,
  ${cause}::TEXT AS cause,
  ${delta_amount}::TEXT AS delta_amount,
  ${standard}::TEXT AS standard,
  ${block_timestamp}::TEXT AS block_timestamp,
  ${shard_id}::INT AS shard_id,
  ${event_type}::INT AS event_type,
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
  AND t.block_timestamp <= ${block_timestamp}::BIGINT
  AND t.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000 -- 5m in ns
  JOIN blocks b ON b.block_hash = t.included_in_block_hash
  AND b.block_timestamp <= ${block_timestamp}::BIGINT
  AND b.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000 -- 5m in ns
WHERE
  r.receipt_id = ${receipt_id}::TEXT
  AND r.included_in_block_timestamp = ${block_timestamp}::BIGINT
