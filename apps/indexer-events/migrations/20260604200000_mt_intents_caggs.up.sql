CREATE
OR REPLACE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000000000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE IF NOT EXISTS mt_intents_values (
  block_timestamp BIGINT NOT NULL, -- ns
  shard_id SMALLINT NOT NULL,
  event_index INT NOT NULL,
  token_id TEXT NOT NULL,
  blockchain TEXT,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  cause TEXT NOT NULL,
  delta_amount NUMERIC(40) NOT NULL,
  price NUMERIC(32, 12),
  value NUMERIC(60, 12),
  PRIMARY KEY (block_timestamp, shard_id, event_index)
);

SELECT
  create_hypertable (
    'mt_intents_values',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'mt_intents_values',
    'epoch_nano_seconds',
    replace_if_exists => true
  );

CREATE INDEX IF NOT EXISTS miv_token_ts_idx ON mt_intents_values (token_id, block_timestamp DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS mt_intents_stats_daily
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  SUM(value) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS volume,
  SUM(value) FILTER (
    WHERE
      delta_amount > 0
      AND cause = 'MINT'
  ) AS volume_mint,
  SUM(value) FILTER (
    WHERE
      delta_amount < 0
      AND cause = 'BURN'
  ) AS volume_burn,
  SUM(value) FILTER (
    WHERE
      delta_amount > 0
      AND cause = 'TRANSFER'
  ) AS volume_transfer,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers,
  COUNT(DISTINCT token_id) AS tokens,
  COUNT(DISTINCT blockchain) AS chains,
  COUNT(DISTINCT affected_account_id) AS accounts,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS senders
FROM
  mt_intents_values
GROUP BY
  date
ORDER BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'mt_intents_stats_daily',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );
