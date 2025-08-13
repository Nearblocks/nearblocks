CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE contract_code_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  index_in_chunk INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  code_hash TEXT,
  code_base64 TEXT
);

SELECT
  create_hypertable (
    'contract_code_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('contract_code_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX cce_shard_index_uidx ON contract_code_events (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX cce_block_timestamp_brin_idx ON contract_code_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

CREATE INDEX cce_contract_sort_uidx ON contract_code_events (
  contract_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE TABLE contract_data_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  index_in_chunk INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  key_base64 TEXT NOT NULL,
  value_base64 TEXT
);

SELECT
  create_hypertable (
    'contract_data_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('contract_data_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX cde_shard_index_uidx ON contract_data_events (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX cde_block_timestamp_brin_idx ON contract_data_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

CREATE INDEX cde_contract_sort_uidx ON contract_data_events (
  contract_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX cde_contract_key_uidx ON contract_data_events (contract_account_id, key_base64);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
