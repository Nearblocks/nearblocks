CREATE TABLE multichain_transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  TIMESTAMP BIGINT,
  chain TEXT NOT NULL,
  transaction TEXT NOT NULL,
  address TEXT NOT NULL,
  signature BYTEA,
  r BYTEA,
  s BYTEA,
  v INTEGER
);

SELECT
  create_hypertable (
    'multichain_transactions',
    by_range ('timestamp', BIGINT '2592000'), -- 30d
    create_default_indexes => false
  );

CREATE UNIQUE INDEX mt_transaction_chain_uidx ON multichain_transactions (transaction, chain, TIMESTAMP);

CREATE INDEX mt_timestamp_idx ON multichain_transactions (TIMESTAMP DESC);

CREATE INDEX mt_signature_idx ON multichain_transactions (signature, TIMESTAMP);

CREATE INDEX mt_r_s_idx ON multichain_transactions (r, s, TIMESTAMP);
