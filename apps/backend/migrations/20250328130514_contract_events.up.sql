CREATE TYPE contract_event_type AS ENUM('UPDATE', 'DELETE');

CREATE TABLE contract_code_events (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  code_hash TEXT,
  code_base64 TEXT,
  event_type contract_event_type NOT NULL,
  status event_status,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE TABLE contract_data_events (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  key_base64 TEXT NOT NULL,
  value_base64 TEXT,
  event_type contract_event_type NOT NULL,
  status event_status,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE INDEX cce_contract_account_id_idx ON contract_code_events USING btree (contract_account_id);

CREATE INDEX cce_block_height_idx ON contract_code_events USING btree (block_height DESC);

CREATE INDEX cce_block_timestamp_idx ON contract_code_events USING btree (block_timestamp DESC);

CREATE INDEX cce_code_hash_idx ON contract_code_events USING btree (code_hash)
WHERE
  code_hash IS NOT NULL;

CREATE INDEX cce_event_type_idx ON contract_code_events USING btree (event_type);

CREATE INDEX cce_status_idx ON contract_code_events USING btree (status);

CREATE INDEX cde_contract_account_id_idx ON contract_data_events USING btree (contract_account_id);

CREATE INDEX cde_block_height_idx ON contract_data_events USING btree (block_height DESC);

CREATE INDEX cde_block_timestamp_idx ON contract_data_events USING btree (block_timestamp DESC);

CREATE INDEX cde_key_base64_idx ON contract_data_events USING btree (key_base64 DESC);

CREATE INDEX cde_event_type_idx ON contract_data_events USING btree (event_type);

CREATE INDEX cde_status_idx ON contract_data_events USING btree (status);
