CREATE TABLE balance_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  index_in_chunk INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  staked_amount NUMERIC(40) NOT NULL,
  nonstaked_amount NUMERIC(40) NOT NULL,
  affected_account_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  cause TEXT NOT NULL,
  transaction_hash TEXT,
  receipt_id TEXT,
  involved_account_id TEXT
);

SELECT
  create_hypertable (
    'balance_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

CREATE UNIQUE INDEX be_shard_index_uidx ON balance_events (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX be_account_timestamp_shard_index_idx ON balance_events (
  affected_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX be_account_timestamp_idx ON balance_events (affected_account_id, block_timestamp);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
