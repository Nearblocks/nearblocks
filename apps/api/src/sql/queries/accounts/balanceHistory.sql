SELECT
  affected_account_id AS account_id,
  nonstaked_amount::TEXT AS amount,
  staked_amount::TEXT AS amount_staked,
  storage_usage::TEXT,
  block_height::TEXT,
  block_timestamp::TEXT
FROM
  balance_events
WHERE
  affected_account_id = ${account}
  AND block_timestamp < ${timestamp}
ORDER BY
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
LIMIT
  1
