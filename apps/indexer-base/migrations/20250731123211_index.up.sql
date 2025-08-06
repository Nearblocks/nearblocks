CREATE INDEX IF NOT EXISTS t_signer_timestamp_shard_index_idx ON transactions (
  signer_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX IF NOT EXISTS t_receiver_timestamp_shard_index_idx ON transactions (
  receiver_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX IF NOT EXISTS r_predecessor_timestamp_shard_index_idx ON receipts (
  predecessor_account_id,
  included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX IF NOT EXISTS r_receiver_timestamp_shard_index_idx ON receipts (
  receiver_account_id,
  included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

ALTER TABLE action_receipt_actions
ADD COLUMN method TEXT GENERATED ALWAYS AS (args ->> 'method_name') STORED;

CREATE INDEX ara_method_idx ON action_receipt_actions (method)
WHERE
  method IS NOT NULL;

CREATE INDEX ara_action_kind_idx ON action_receipt_actions (action_kind);
