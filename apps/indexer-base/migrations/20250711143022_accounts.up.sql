CREATE TABLE access_keys (
  created_by_block_timestamp BIGINT NOT NULL,
  deleted_by_block_timestamp BIGINT,
  public_key TEXT NOT NULL,
  account_id TEXT NOT NULL,
  permission_kind TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  permission JSONB,
  PRIMARY KEY (public_key, account_id)
);

CREATE INDEX ak_public_key_idx ON access_keys (public_key);

CREATE INDEX ak_account_last_action_idx ON access_keys (
  account_id,
  GREATEST(
    created_by_block_timestamp,
    COALESCE(deleted_by_block_timestamp, 0)
  ) DESC
);

CREATE TABLE accounts (
  created_by_block_timestamp BIGINT NOT NULL,
  deleted_by_block_timestamp BIGINT,
  account_id text NOT NULL,
  created_by_receipt_id text,
  deleted_by_receipt_id text,
  PRIMARY KEY (account_id)
);
