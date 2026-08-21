CREATE TABLE ft_state_balances (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  shard_id SMALLINT NOT NULL,
  index_in_chunk INT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  absolute_amount NUMERIC(40) NOT NULL,
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

CREATE TABLE ft_state_holders (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  block_height BIGINT NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE INDEX fsh_account_amount_desc ON ft_state_holders (account, amount DESC);

CREATE INDEX fsh_contract_amount_desc ON ft_state_holders (contract, amount DESC, account ASC);

CREATE TABLE ft_state_untracked (
  contract TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  block_height BIGINT NOT NULL
);

CREATE MATERIALIZED VIEW IF NOT EXISTS account_ft_balances
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  contract_account_id AS contract,
  LAST (
    absolute_amount,
    block_timestamp + shard_id * 1000000 + index_in_chunk
  ) AS absolute_amount,
  LAST (
    block_height,
    block_timestamp + shard_id * 1000000 + index_in_chunk
  ) AS block_height
FROM
  ft_state_balances
GROUP BY
  date,
  account,
  contract
ORDER BY
  date,
  account,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_ft_balances',
    start_offset => '259200000000000', -- 3d
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_afb_account_contract_idx ON account_ft_balances (account, contract, date DESC);
