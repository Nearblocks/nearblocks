CREATE TABLE mt_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  event_index INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  delta_amount NUMERIC(40) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  standard TEXT NOT NULL,
  cause TEXT NOT NULL,
  involved_account_id TEXT,
  authorized_account_id TEXT,
  event_memo TEXT
);

SELECT
  create_hypertable (
    'mt_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('mt_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX me_shard_index_uidx ON mt_events (
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX me_contract_sort_idx ON mt_events (
  contract_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX me_contract_token_sort_idx ON mt_events (
  contract_account_id,
  token_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX me_account_sort_idx ON mt_events (
  affected_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);
