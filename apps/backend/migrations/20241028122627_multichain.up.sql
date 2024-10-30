CREATE TABLE multichain_accounts (
  account_id TEXT NOT NULL,
  derived_address TEXT NOT NULL,
  public_key TEXT NOT NULL,
  chain TEXT NOT NULL,
  path TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (account_id, derived_address)
);

CREATE TABLE multichain_transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  receipt_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  derived_address TEXT NOT NULL,
  public_key TEXT NOT NULL,
  chain TEXT NOT NULL,
  path TEXT NOT NULL,
  derived_transaction TEXT,
  block_height NUMERIC(20, 0) NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (receipt_id)
);

CREATE INDEX ma_account_id_idx ON multichain_accounts USING btree (account_id);

CREATE INDEX ma_derived_address_idx ON multichain_accounts USING btree (derived_address);

CREATE INDEX ma_block_height_idx ON multichain_accounts USING btree (block_height DESC);

CREATE INDEX ma_block_timestamp_idx ON multichain_accounts USING btree (block_timestamp DESC);

CREATE INDEX mt_receipt_id_idx ON multichain_transactions USING btree (receipt_id);

CREATE INDEX mt_account_id_idx ON multichain_transactions USING btree (account_id);

CREATE INDEX mt_derived_address_idx ON multichain_transactions USING btree (derived_address);

CREATE INDEX mt_derived_transaction_idx ON multichain_transactions USING btree (derived_transaction)
WHERE
  derived_transaction IS NOT NULL;

CREATE INDEX mt_block_height_idx ON multichain_transactions USING btree (block_height DESC);

CREATE INDEX mt_block_timestamp_idx ON multichain_transactions USING btree (block_timestamp DESC);
