SELECT
  block_timestamp,
  receipt_id
FROM
  contract_code_events
WHERE
  contract_account_id = ${account}
  AND block_timestamp >= ${start} -- rolling window start
  AND block_timestamp <= ${end} -- rolling window end
ORDER BY
  block_timestamp ${order:raw},
  shard_id ${order:raw},
  index_in_chunk ${order:raw}
LIMIT
  1
