CREATE SCHEMA rebuild;

CREATE TABLE rebuild.accounts (
  created_by_block_timestamp BIGINT NOT NULL,
  deleted_by_block_timestamp BIGINT,
  account_id TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  parent TEXT,
  PRIMARY KEY (account_id)
);

CREATE FUNCTION rebuild.update_account_parent () RETURNS TRIGGER AS $$
BEGIN
  UPDATE accounts a
  SET
    parent = CASE
      WHEN strpos(n.account_id, '.') > 0
        THEN substring(n.account_id FROM strpos(n.account_id, '.') + 1)
      ELSE NULL
    END
  FROM new_table n
  WHERE a.account_id = n.account_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_parent_trigger
AFTER INSERT ON rebuild.accounts REFERENCING NEW TABLE AS new_table FOR EACH STATEMENT
EXECUTE FUNCTION rebuild.update_account_parent ();

CREATE INDEX a_parent_account_idx ON rebuild.accounts (parent, account_id);

CREATE INDEX a_account_id_prefix_idx ON rebuild.accounts (account_id text_pattern_ops);

CREATE TABLE rebuild.access_keys (
  created_by_block_timestamp BIGINT NOT NULL,
  deleted_by_block_timestamp BIGINT,
  public_key TEXT NOT NULL,
  account_id TEXT NOT NULL,
  permission_kind TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  permission JSONB,
  action_timestamp BIGINT GENERATED ALWAYS AS (
    GREATEST(
      created_by_block_timestamp,
      COALESCE(deleted_by_block_timestamp, 0)
    )
  ) STORED,
  PRIMARY KEY (public_key, account_id)
);

CREATE INDEX ak_public_key_idx ON rebuild.access_keys (public_key);

CREATE INDEX ak_account_action_timestamp_public_key_id ON rebuild.access_keys (
  account_id,
  action_timestamp DESC,
  public_key DESC
);

CREATE TABLE rebuild.settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
