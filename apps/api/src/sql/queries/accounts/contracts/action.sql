SELECT
  args
FROM
  action_receipt_actions
WHERE
  receipt_receiver_account_id = ${account}
  AND method = ${method}
  AND receipt_included_in_block_timestamp >= ${start} -- rolling window start
  AND receipt_included_in_block_timestamp <= ${end} -- rolling window end
ORDER BY
  receipt_included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC,
  index_in_action_receipt DESC
LIMIT
  1
