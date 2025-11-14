CREATE MATERIALIZED VIEW contract_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  COUNT(DISTINCT code_hash) AS contracts
FROM
  contract_code_events
WHERE
  event_type = 'UPDATE'
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'contract_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1m in ns
    schedule_interval => INTERVAL '1 hour'
  );
