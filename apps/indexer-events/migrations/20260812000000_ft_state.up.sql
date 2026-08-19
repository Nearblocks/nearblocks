CREATE TABLE ft_state_balances (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  shard_id SMALLINT NOT NULL,
  index_in_chunk INT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  receipt_id TEXT
);

SELECT
  create_hypertable (
    'ft_state_balances',
    by_range ('block_timestamp', BIGINT '2592000000000000'),
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('ft_state_balances', 'epoch_nano_seconds');

CREATE UNIQUE INDEX fsb_shard_index_uidx ON ft_state_balances (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX fsb_contract_account_idx ON ft_state_balances (
  contract_account_id,
  affected_account_id,
  block_timestamp DESC
);

CREATE INDEX fsb_block_timestamp_brin_idx ON ft_state_balances USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

ALTER TABLE ft_state_balances
SET
  (
    timescaledb.compress = TRUE,
    timescaledb.compress_orderby = 'block_timestamp DESC, shard_id DESC, index_in_chunk DESC'
  );

SELECT
  add_compression_policy ('ft_state_balances', BIGINT '2592000000000000');

CREATE TABLE ft_contract_layouts (
  contract TEXT PRIMARY KEY,
  code_hash TEXT,
  key_prefix BYTEA,
  key_encoding TEXT,
  account_offset INT,
  account_path TEXT,
  value_offset INT,
  value_path TEXT,
  value_encoding TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  observations INT NOT NULL DEFAULT 0,
  discovered_at_height BIGINT,
  verified_at_height BIGINT,
  probed_at BIGINT,
  note TEXT,
  CONSTRAINT fcl_status_chk CHECK (
    status IN ('pending', 'verified', 'unsupported', 'rejected')
  ),
  CONSTRAINT fcl_key_encoding_chk CHECK (
    key_encoding IS NULL
    OR key_encoding IN ('borsh', 'index')
  ),
  CONSTRAINT fcl_account_offset_chk CHECK (
    account_offset IS NULL
    OR key_encoding = 'index'
  ),
  CONSTRAINT fcl_value_encoding_chk CHECK (
    value_encoding IS NULL
    OR value_encoding IN ('u128le', 'json')
  ),
  CONSTRAINT fcl_index_needs_offsets_chk CHECK (
    key_encoding <> 'index'
    OR value_encoding <> 'u128le'
    OR (
      account_offset IS NOT NULL
      AND value_offset IS NOT NULL
    )
  ),
  CONSTRAINT fcl_json_needs_paths_chk CHECK (
    value_encoding <> 'json'
    OR (
      account_path IS NOT NULL
      AND value_path IS NOT NULL
    )
  ),
  CONSTRAINT fcl_verified_needs_layout_chk CHECK (
    status <> 'verified'
    OR (
      key_prefix IS NOT NULL
      AND key_encoding IS NOT NULL
      AND value_encoding IS NOT NULL
    )
  )
);

CREATE INDEX fcl_status_idx ON ft_contract_layouts (status);

CREATE INDEX fcl_code_hash_verified_idx ON ft_contract_layouts (code_hash)
WHERE
  status = 'verified'
  AND code_hash IS NOT NULL;

CREATE TABLE ft_state_holders (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  block_height BIGINT NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE INDEX fsh_account_amount_desc ON ft_state_holders (account, amount DESC);

CREATE INDEX fsh_contract_amount_desc ON ft_state_holders (contract, amount DESC, account ASC);
