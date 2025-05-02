CREATE TABLE multichain_signatures (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  block_timestamp BIGINT,
  transaction_hash TEXT NOT NULL,
  account_id TEXT,
  path TEXT,
  scheme TEXT,
  signature BYTEA,
  r BYTEA,
  s BYTEA,
  v INTEGER
);

SELECT
  create_hypertable (
    'multichain_signatures',
    by_range ('block_timestamp', BIGINT '2592000'), -- 30d
    create_default_indexes => false
  );

CREATE UNIQUE INDEX ms_transaction_uidx ON multichain_signatures (transaction_hash, block_timestamp);

CREATE INDEX ms_block_timestamp_idx ON multichain_signatures (block_timestamp DESC);

CREATE INDEX ms_account_timestamp_id_desc_idx ON multichain_signatures (account_id, block_timestamp, id DESC);

CREATE INDEX ms_signature_idx ON multichain_signatures (signature);

CREATE INDEX ms_r_s_idx ON multichain_signatures (r, s);
