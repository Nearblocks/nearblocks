SELECT
  ev.contract_account_id,
  ev.affected_account_id,
  ev.involved_account_id,
  ev.token_id,
  ev.cause,
  ev.delta_amount,
  ev.block_timestamp::TEXT AS block_timestamp,
  ev.shard_id,
  ev.event_index,
  ev.meta,
  ev.token_meta,
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
  UNNEST(
    ${receipt_id}::TEXT [],
    ${contract_account_id}::TEXT [],
    ${affected_account_id}::TEXT [],
    ${involved_account_id}::TEXT [],
    ${token_id}::TEXT [],
    ${cause}::TEXT [],
    ${delta_amount}::TEXT [],
    ${block_timestamp}::BIGINT[],
    ${shard_id}::SMALLINT[],
    ${event_index}::INTEGER[],
    ${meta}::JSONB[],
    ${token_meta}::JSONB[]
  ) AS ev (
    receipt_id,
    contract_account_id,
    affected_account_id,
    involved_account_id,
    token_id,
    cause,
    delta_amount,
    block_timestamp,
    shard_id,
    event_index,
    meta,
    token_meta
  )
  JOIN receipts r ON r.receipt_id = ev.receipt_id
  AND r.included_in_block_timestamp <= ev.block_timestamp
  AND r.included_in_block_timestamp >= ev.block_timestamp - 300000000000 -- 5m in ns
  AND r.included_in_block_timestamp >= ${start_timestamp}::BIGINT - 300000000000 -- 5m in ns
  AND r.included_in_block_timestamp <= ${end_timestamp}::BIGINT
  JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
  AND t.block_timestamp <= ev.block_timestamp
  AND t.block_timestamp >= ev.block_timestamp - 300000000000 -- 5m in ns
  AND t.block_timestamp >= ${start_timestamp}::BIGINT - 300000000000 -- 5m in ns
  AND t.block_timestamp <= ${end_timestamp}::BIGINT
  JOIN blocks b ON b.block_hash = t.included_in_block_hash
  AND b.block_timestamp <= ev.block_timestamp
  AND b.block_timestamp >= ev.block_timestamp - 300000000000 -- 5m in ns
  AND b.block_timestamp >= ${start_timestamp}::BIGINT - 300000000000 -- 5m in ns
  AND b.block_timestamp <= ${end_timestamp}::BIGINT
