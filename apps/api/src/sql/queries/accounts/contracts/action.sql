SELECT
  args
FROM
  action_receipt_actions
WHERE
  method = ${method}
ORDER BY
  receipt_included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC,
  index_in_action_receipt DESC
LIMIT
  1
