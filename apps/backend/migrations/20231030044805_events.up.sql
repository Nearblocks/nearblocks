CREATE TYPE event_cause AS ENUM('MINT', 'TRANSFER', 'BURN');

CREATE TABLE ft_events (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount NUMERIC(40) NOT NULL,
  absolute_amount NUMERIC(40),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index, block_timestamp)
);

CREATE TABLE nft_events (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  affected_account_id TEXT,
  involved_account_id TEXT,
  authorized_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount SMALLINT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index, block_timestamp)
);

CREATE INDEX fte_contract_account_id_idx ON ft_events USING btree (contract_account_id);

CREATE INDEX fte_affected_account_id_idx ON ft_events USING btree (affected_account_id);

CREATE INDEX nfte_contract_account_id_idx ON nft_events USING btree (contract_account_id);

CREATE INDEX nfte_affected_account_id_idx ON nft_events USING btree (affected_account_id);

SELECT
  create_hypertable (
    'ft_events',
    'block_timestamp',
    chunk_time_interval = > 604800000000000
  );

SELECT
  create_hypertable (
    'nft_events',
    'block_timestamp',
    chunk_time_interval = > 3628800000000000
  );

SELECT
  set_integer_now_func ('ft_events', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('nft_events', 'epoch_nano_seconds');
