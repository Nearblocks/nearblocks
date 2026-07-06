DROP MATERIALIZED VIEW IF EXISTS mt_intents_stats_daily;

DROP TABLE IF EXISTS intents_meta;

DROP TABLE IF EXISTS mt_intents_values;

DELETE FROM settings
WHERE
  key = 'mt_intents_values';

CREATE TABLE IF NOT EXISTS mt_intents_swaps (
  block_timestamp BIGINT NOT NULL, -- ns
  shard_id SMALLINT NOT NULL,
  event_index INT NOT NULL,
  receipt_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  delta_amount NUMERIC(40) NOT NULL,
  fee_amount NUMERIC(40),
  referral TEXT,
  PRIMARY KEY (block_timestamp, shard_id, event_index)
);

SELECT
  create_hypertable (
    'mt_intents_swaps',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'mt_intents_swaps',
    'epoch_nano_seconds',
    replace_if_exists => true
  );

CREATE INDEX IF NOT EXISTS is_token_ts_idx ON mt_intents_swaps (token_id, block_timestamp DESC);

CREATE TABLE IF NOT EXISTS mt_intents_stats (
  date BIGINT NOT NULL, -- day bucket, epoch ms
  token_id TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  swaps INT NOT NULL,
  volume NUMERIC(60, 24) NOT NULL, -- decimal-adjusted token units, sum of positive diffs
  fee NUMERIC(60, 24), -- decimal-adjusted token units, sum of fees collected
  price NUMERIC(32, 12),
  volume_usd NUMERIC(60, 12),
  fee_usd NUMERIC(60, 12),
  PRIMARY KEY (date, token_id)
);
