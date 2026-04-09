CREATE MATERIALIZED VIEW block_stats_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (3600000000000, block_timestamp) AS date, -- 1h in ns
  COUNT(*) AS blocks,
  AVG(gas_price) AS gas_price
FROM
  blocks
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'block_stats_hourly',
    start_offset => '10800000000000', -- 3h in ns
    end_offset => '900000000000', -- 15m in ns
    schedule_interval => INTERVAL '15 minutes'
  );

SELECT
  add_retention_policy (
    'block_stats_hourly',
    drop_after => BIGINT '259200000000000' -- 3d in ns
  );

CREATE MATERIALIZED VIEW chunk_stats_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (3600000000000, included_in_block_timestamp) AS date, -- 1h in ns
  SUM(gas_used) AS gas_used,
  SUM(gas_limit) AS gas_limit
FROM
  chunks
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'chunk_stats_hourly',
    start_offset => '10800000000000', -- 3h in ns
    end_offset => '900000000000', -- 15m in ns
    schedule_interval => INTERVAL '15 minutes'
  );

SELECT
  add_retention_policy (
    'chunk_stats_hourly',
    drop_after => BIGINT '259200000000000' -- 3d in ns
  );

CREATE MATERIALIZED VIEW outcome_stats_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (3600000000000, executed_in_block_timestamp) AS date, -- 1h in ns
  SUM(tokens_burnt) AS tokens_burnt
FROM
  execution_outcomes
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'outcome_stats_hourly',
    start_offset => '10800000000000', -- 3h in ns
    end_offset => '900000000000', -- 15m in ns
    schedule_interval => INTERVAL '15 minutes'
  );

SELECT
  add_retention_policy (
    'outcome_stats_hourly',
    drop_after => BIGINT '259200000000000' -- 3d in ns
  );

CREATE MATERIALIZED VIEW transaction_stats_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (3600000000000, block_timestamp) AS date, -- 1h in ns
  COUNT(*) AS txns
FROM
  transactions
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'transaction_stats_hourly',
    start_offset => '10800000000000', -- 3h in ns
    end_offset => '900000000000', -- 15m in ns
    schedule_interval => INTERVAL '15 minutes'
  );

SELECT
  add_retention_policy (
    'transaction_stats_hourly',
    drop_after => BIGINT '259200000000000' -- 3d in ns
  );
