CREATE MATERIALIZED VIEW IF NOT EXISTS signer_txn_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, included_in_block_timestamp) AS date, -- 1d in ns
  COUNT(DISTINCT originated_from_transaction_hash) AS txns,
  COUNT(DISTINCT predecessor_account_id) AS signers
FROM
  receipts
WHERE
  receiver_account_id = '__SIGNER_ACCOUNT__'
GROUP BY
  1
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'signer_txn_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE MATERIALIZED VIEW IF NOT EXISTS signer_gas_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, executed_in_block_timestamp) AS date, -- 1d in ns
  SUM(gas_burnt) AS gas_burnt
FROM
  execution_outcomes
WHERE
  executor_account_id = '__SIGNER_ACCOUNT__'
GROUP BY
  1
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'signer_gas_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );
