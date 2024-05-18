CREATE TABLE IF NOT EXISTS temp_receipts (
  id BIGSERIAL,
  receipt_id TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_kind receipt_kind NOT NULL,
  originated_from_transaction_hash TEXT NOT NULL,
  included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (receipt_id)
);

CREATE TABLE IF NOT EXISTS temp_transactions (
  id BIGSERIAL,
  transaction_hash TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  signer_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  status execution_outcome_status NOT NULL,
  converted_into_receipt_id TEXT NOT NULL,
  receipt_conversion_gas_burnt NUMERIC(20, 0),
  receipt_conversion_tokens_burnt NUMERIC(45, 0),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (transaction_hash)
);

CREATE INDEX IF NOT EXISTS r_included_in_block_hash_idx ON temp_receipts USING btree (included_in_block_hash);

CREATE INDEX IF NOT EXISTS r_included_in_chunk_hash_idx ON temp_receipts USING btree (included_in_chunk_hash);

CREATE INDEX IF NOT EXISTS r_originated_from_transaction_hash_idx ON temp_receipts USING btree (originated_from_transaction_hash);

CREATE INDEX IF NOT EXISTS r_predecessor_account_id_idx ON temp_receipts USING btree (predecessor_account_id);

CREATE INDEX IF NOT EXISTS r_receiver_account_id_idx ON temp_receipts USING btree (receiver_account_id);

CREATE INDEX IF NOT EXISTS r_included_in_block_timestamp_idx ON temp_receipts USING btree (included_in_block_timestamp DESC);

CREATE INDEX IF NOT EXISTS t_converted_into_receipt_id_dx ON temp_transactions USING btree (converted_into_receipt_id);

CREATE INDEX IF NOT EXISTS t_included_in_block_hash_idx ON temp_transactions USING btree (included_in_block_hash);

CREATE INDEX IF NOT EXISTS t_block_timestamp_idx ON temp_transactions USING btree (block_timestamp DESC);

CREATE INDEX IF NOT EXISTS t_included_in_chunk_hash_idx ON temp_transactions USING btree (included_in_chunk_hash);

CREATE INDEX IF NOT EXISTS t_receiver_account_id_idx ON temp_transactions USING btree (receiver_account_id);

CREATE INDEX IF NOT EXISTS t_signer_account_id_idx ON temp_transactions USING btree (signer_account_id);

DROP TABLE receipts;

DROP TABLE transactions;

ALTER TABLE temp_receipts
RENAME TO receipts;

ALTER TABLE temp_transactions
RENAME TO transactions;
