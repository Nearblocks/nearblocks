CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE staking_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  index_in_chunk INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  amount NUMERIC(40),
  delta_shares NUMERIC(40),
  absolute_shares NUMERIC(40),
  absolute_unstaked_amount NUMERIC(40),
  contract_staked NUMERIC(40),
  contract_shares NUMERIC(40),
  epoch_id TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  contract TEXT NOT NULL,
  account TEXT,
  type TEXT
);

SELECT
  create_hypertable (
    'staking_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('staking_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX se_shard_index_uidx ON staking_events (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX se_block_timestamp_brin_idx ON staking_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
