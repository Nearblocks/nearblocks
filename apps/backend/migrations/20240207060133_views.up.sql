CREATE MATERIALIZED VIEW balance_events_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  affected_account_id AS account,
  last (absolute_staked_amount, block_timestamp) AS staked_amount,
  last (absolute_nonstaked_amount, block_timestamp) AS nonstaked_amount
FROM
  balance_events
GROUP BY
  account,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'balance_events_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_events_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract,
  affected_account_id as account,
  last (absolute_amount, block_timestamp) AS amount
FROM
  ft_events
GROUP BY
  contract,
  account,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_events_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_holders_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '3600000000000', block_timestamp) AS time_hourly,
  contract_account_id AS contract,
  affected_account_id AS account,
  SUM(delta_amount) AS amount,
  STATS_AGG (delta_amount) AS amount_hourly
FROM
  ft_events
GROUP BY
  contract,
  account,
  time_hourly
HAVING
  SUM(delta_amount) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_hourly',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000',
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW ft_holders_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', time_hourly) AS time_daily,
  contract,
  account,
  SUM(rollup (amount_hourly)) AS amount,
  rollup (amount_hourly) AS amount_daily
FROM
  ft_holders_hourly
GROUP BY
  contract,
  account,
  time_daily
HAVING
  SUM(rollup (amount_hourly)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_holders_monthly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '2592000000000000', time_daily) AS time_monthly,
  contract,
  account,
  SUM(rollup (amount_daily)) AS amount,
  rollup (amount_daily) AS amount_monthly
FROM
  ft_holders_daily
GROUP BY
  contract,
  account,
  time_monthly
HAVING
  SUM(rollup (amount_daily)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_monthly',
    start_offset => NULL,
    end_offset => BIGINT '2592000000000000',
    schedule_interval => INTERVAL '30 day'
  );

CREATE MATERIALIZED VIEW ft_contracts_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract
FROM
  ft_events
GROUP BY
  contract,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_contracts_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW nft_holders_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '3600000000000', block_timestamp) AS time_hourly,
  contract_account_id AS contract,
  token_id AS token,
  affected_account_id AS account,
  SUM(delta_amount) AS quantity,
  STATS_AGG (delta_amount) AS quantity_hourly
FROM
  nft_events
GROUP BY
  contract,
  token,
  account,
  time_hourly
HAVING
  SUM(delta_amount) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_holders_hourly',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000',
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW nft_holders_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', time_hourly) AS time_daily,
  contract,
  token,
  account,
  SUM(rollup (quantity_hourly)) AS quantity,
  rollup (quantity_hourly) AS quantity_daily
FROM
  nft_holders_hourly
GROUP BY
  contract,
  token,
  account,
  time_daily
HAVING
  SUM(rollup (quantity_hourly)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_holders_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW nft_contracts_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract,
  token_id AS token
FROM
  nft_events
GROUP BY
  contract,
  token,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_contracts_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );
