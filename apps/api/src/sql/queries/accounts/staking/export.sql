SELECT
  se.block_timestamp,
  se.shard_id,
  se.index_in_chunk,
  se.receipt_id,
  se.contract,
  se.account,
  se.type,
  se.amount
FROM
  staking_events se
WHERE
  se.account = ${account}
  AND se.block_timestamp >= ${start}::BIGINT
  AND se.block_timestamp <= ${end}::BIGINT
ORDER BY
  se.block_timestamp ASC,
  se.shard_id ASC,
  se.index_in_chunk ASC
LIMIT
  5000
