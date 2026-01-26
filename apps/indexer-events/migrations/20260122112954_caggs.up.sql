DROP MATERIALIZED VIEW IF EXISTS ft_account_stats;

DROP MATERIALIZED VIEW IF EXISTS nft_contract_stats;

DROP MATERIALIZED VIEW IF EXISTS nft_account_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS ft_account_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  contract_account_id AS contract,
  COUNT(*) AS transfers,
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount < 0 THEN ABS(delta_amount)
        ELSE 0
      END
    ),
    0
  ) AS amount_out,
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount > 0 THEN delta_amount
        ELSE 0
      END
    ),
    0
  ) AS amount_in,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_out,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_in
FROM
  ft_events
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
    'ft_account_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE MATERIALIZED VIEW IF NOT EXISTS account_ft_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  COUNT(DISTINCT contract_account_id) AS contracts,
  COUNT(*) AS transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_out,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_in
FROM
  ft_events
GROUP BY
  date,
  account
ORDER BY
  date,
  account
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_ft_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );
