CREATE TYPE event_status AS ENUM (
  'UNKNOWN',
  'FAILURE',
  'SUCCESS'
);

CREATE TYPE balance_event_cause AS ENUM (
  'VALIDATORS_REWARD',
  'TRANSACTION',
  'RECEIPT',
  'CONTRACT_REWARD'
);

CREATE TYPE balance_event_direction AS ENUM (
  'INBOUND',
  'OUTBOUND'
);



CREATE TABLE balance_events (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  transaction_hash TEXT,
  receipt_id TEXT,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  direction balance_event_direction,
  cause balance_event_cause,
  status event_status,
	delta_staked_amount NUMERIC(40),
	delta_nonstaked_amount NUMERIC(40),
	absolute_staked_amount NUMERIC(40) NOT NULL,
	absolute_nonstaked_amount NUMERIC(40) NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (
    event_index,
    block_timestamp
  )
);



CREATE INDEX be_affected_account_id_idx ON balance_events USING btree (affected_account_id);



SELECT create_hypertable ('balance_events', 'block_timestamp', chunk_time_interval => 604800000000000);



SELECT set_integer_now_func('balance_events', 'epoch_nano_seconds');
