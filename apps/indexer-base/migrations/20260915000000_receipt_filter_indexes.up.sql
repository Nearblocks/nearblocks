CREATE INDEX IF NOT EXISTS ara_receiver_method_ts_idx ON action_receipt_actions (
  receipt_receiver_account_id,
  method,
  receipt_included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC,
  index_in_action_receipt DESC
)
WHERE
  method IS NOT NULL;

CREATE INDEX IF NOT EXISTS ara_predecessor_method_ts_idx ON action_receipt_actions (
  receipt_predecessor_account_id,
  method,
  receipt_included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC,
  index_in_action_receipt DESC
)
WHERE
  method IS NOT NULL;
