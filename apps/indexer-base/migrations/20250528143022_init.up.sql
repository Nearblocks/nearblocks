CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE access_keys (
  created_by_block_height BIGINT NOT NULL,
  deleted_by_block_height BIGINT,
  public_key TEXT NOT NULL,
  account_id TEXT NOT NULL,
  permission_kind TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  permission JSONB,
  PRIMARY KEY (public_key, account_id)
);

CREATE TABLE accounts (
  created_by_block_height BIGINT NOT NULL,
  deleted_by_block_height BIGINT,
  account_id text NOT NULL,
  created_by_receipt_id text,
  deleted_by_receipt_id text,
  PRIMARY KEY (account_id)
);

CREATE TABLE action_receipt_actions (
  receipt_included_in_block_timestamp BIGINT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  index_in_action_receipt INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  receipt_predecessor_account_id TEXT NOT NULL,
  receipt_receiver_account_id TEXT NOT NULL,
  action_kind TEXT NOT NULL,
  nep518_rlp_hash TEXT,
  args JSONB NOT NULL
);

SELECT
  create_hypertable (
    'action_receipt_actions',
    by_range (
      'receipt_included_in_block_timestamp',
      BIGINT '2592000000000000'
    ), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('action_receipt_actions', 'epoch_nano_seconds');

CREATE UNIQUE INDEX ara_hash_index_timestamp_uidx ON action_receipt_actions (
  receipt_id,
  index_in_action_receipt DESC,
  receipt_included_in_block_timestamp DESC
);

CREATE INDEX ara_shard_chunk_index_idx ON action_receipt_actions (
  receipt_included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC,
  index_in_action_receipt DESC
);

CREATE INDEX ara_block_timestamp_idx ON action_receipt_actions (receipt_included_in_block_timestamp DESC);

CREATE TABLE action_receipt_input_data (
  input_data_id TEXT NOT NULL,
  input_to_receipt_id TEXT NOT NULL,
  PRIMARY KEY (input_data_id, input_to_receipt_id)
);

CREATE TABLE action_receipt_output_data (
  output_data_id TEXT NOT NULL,
  output_from_receipt_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  PRIMARY KEY (output_data_id, output_from_receipt_id)
);

CREATE TABLE blocks (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  total_supply NUMERIC(45, 0) NOT NULL,
  gas_price NUMERIC(45, 0) NOT NULL,
  block_hash TEXT NOT NULL,
  prev_block_hash TEXT NOT NULL,
  author_account_id TEXT NOT NULL
);

SELECT
  create_hypertable (
    'blocks',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('blocks', 'epoch_nano_seconds');

CREATE UNIQUE INDEX b_block_hash_uidx ON blocks (block_hash, block_timestamp DESC);

CREATE INDEX b_block_timestamp_idx ON blocks (block_timestamp DESC);

CREATE TABLE chunks (
  included_in_block_timestamp BIGINT NOT NULL,
  shard_id SMALLINT NOT NULL,
  gas_limit NUMERIC(20, 0) NOT NULL,
  gas_used NUMERIC(20, 0) NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,
  author_account_id TEXT NOT NULL
);

SELECT
  create_hypertable (
    'chunks',
    by_range (
      'included_in_block_timestamp',
      BIGINT '2592000000000000'
    ), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('chunks', 'epoch_nano_seconds');

CREATE UNIQUE INDEX c_chunk_hash_uidx ON chunks (chunk_hash, included_in_block_timestamp DESC);

CREATE INDEX c_block_hash_idx ON chunks (included_in_block_hash);

CREATE TABLE execution_outcome_receipts (
  index_in_execution_outcome INTEGER NOT NULL,
  executed_receipt_id TEXT NOT NULL,
  produced_receipt_id TEXT NOT NULL,
  PRIMARY KEY (
    executed_receipt_id,
    index_in_execution_outcome,
    produced_receipt_id
  )
);

CREATE TABLE execution_outcomes (
  executed_in_block_timestamp BIGINT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  gas_burnt NUMERIC(20, 0) NOT NULL,
  tokens_burnt NUMERIC(45, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  executed_in_block_hash TEXT NOT NULL,
  executor_account_id TEXT NOT NULL,
  status TEXT NOT NULL,
  logs JSONB,
  result JSONB
);

SELECT
  create_hypertable (
    'execution_outcomes',
    by_range (
      'executed_in_block_timestamp',
      BIGINT '2592000000000000'
    ), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('execution_outcomes', 'epoch_nano_seconds');

CREATE UNIQUE INDEX eo_hash_timestamp_uidx ON execution_outcomes (receipt_id, executed_in_block_timestamp DESC);

CREATE INDEX eo_shard_index_idx ON execution_outcomes (
  executed_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX eo_block_timestamp_idx ON execution_outcomes (executed_in_block_timestamp DESC);

CREATE TABLE receipts (
  included_in_block_timestamp BIGINT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_kind TEXT NOT NULL,
  originated_from_transaction_hash TEXT NOT NULL,
  public_key TEXT
);

SELECT
  create_hypertable (
    'receipts',
    by_range (
      'included_in_block_timestamp',
      BIGINT '2592000000000000'
    ), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('receipts', 'epoch_nano_seconds');

CREATE UNIQUE INDEX r_hash_timestamp_uidx ON receipts (receipt_id, included_in_block_timestamp DESC);

CREATE INDEX r_timestamp_shard_index_idx ON receipts (
  included_in_block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX r_block_timestamp_idx ON receipts (included_in_block_timestamp DESC);

CREATE TABLE transactions (
  block_timestamp BIGINT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_conversion_gas_burnt NUMERIC(20, 0),
  receipt_conversion_tokens_burnt NUMERIC(45, 0),
  transaction_hash TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  signer_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  converted_into_receipt_id TEXT NOT NULL
);

SELECT
  create_hypertable (
    'transactions',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('transactions', 'epoch_nano_seconds');

CREATE UNIQUE INDEX t_hash_timestamp_uidx ON transactions (transaction_hash, block_timestamp DESC);

CREATE INDEX t_timestamp_shard_index_idx ON transactions (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX t_block_timestamp_idx ON transactions (block_timestamp DESC);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
