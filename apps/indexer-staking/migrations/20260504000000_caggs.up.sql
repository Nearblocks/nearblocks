CREATE MATERIALIZED VIEW IF NOT EXISTS account_staking_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  account,
  COUNT(*) AS transfers
FROM
  staking_events
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
    'account_staking_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_ass_account_idx ON account_staking_stats (account);
