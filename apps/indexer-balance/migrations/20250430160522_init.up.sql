CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE balance_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  storage_usage BIGINT NOT NULL,
  index_in_chunk INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  staked_amount NUMERIC(40) NOT NULL,
  nonstaked_amount NUMERIC(40) NOT NULL,
  affected_account_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  cause TEXT NOT NULL,
  transaction_hash TEXT,
  receipt_id TEXT,
  involved_account_id TEXT
);

SELECT
  create_hypertable (
    'balance_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('balance_events', 'epoch_nano_seconds');

CREATE MATERIALIZED VIEW account_near_stats
WITH
  (timescaledb.continuous) AS
SELECT
  affected_account_id AS account,
  TIME_BUCKET (86400000000000, block_timestamp) AS date,
  LAST (nonstaked_amount, block_timestamp) AS amount,
  LAST (staked_amount, block_timestamp) AS amount_staked,
  LAST (storage_usage, block_timestamp) AS storage_usage
FROM
  balance_events
GROUP BY
  account,
  date
ORDER BY
  account,
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_near_stats',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000', -- 1d in ns
    schedule_interval => INTERVAL '1 day'
  );

CREATE UNIQUE INDEX be_shard_index_uidx ON balance_events (
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX be_account_timestamp_shard_index_idx ON balance_events (
  affected_account_id,
  block_timestamp DESC,
  shard_id DESC,
  index_in_chunk DESC
);

CREATE INDEX be_account_timestamp_idx ON balance_events (affected_account_id, block_timestamp);

CREATE TABLE account_balances (
  storage_usage BIGINT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  amount_staked NUMERIC(40) NOT NULL,
  account TEXT NOT NULL,
  PRIMARY KEY (account)
);

CREATE
OR REPLACE FUNCTION update_account_balances () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO account_balances (account, amount, amount_staked, storage_usage)
    SELECT DISTINCT ON (affected_account_id)
      affected_account_id, nonstaked_amount, staked_amount, storage_usage
    FROM new_table
    ORDER BY affected_account_id, block_timestamp DESC, shard_id DESC, index_in_chunk DESC
    ON CONFLICT (account) DO UPDATE
    SET
      amount = EXCLUDED.amount,
      amount_staked = EXCLUDED.amount_staked,
      storage_usage = EXCLUDED.storage_usage;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_balances_trigger
AFTER INSERT ON balance_events REFERENCING NEW TABLE AS new_table FOR EACH STATEMENT
EXECUTE FUNCTION update_account_balances ();

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
