CREATE TABLE IF NOT EXISTS mpc_derived_keys (
  public_key TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  path TEXT NOT NULL,
  domain_id SMALLINT NOT NULL,
  block_timestamp BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS mdk_account_idx ON mpc_derived_keys (account_id);
