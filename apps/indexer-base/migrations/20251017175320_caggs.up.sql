CREATE MATERIALIZED VIEW block_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  COUNT(*) AS blocks,
  LAST (total_supply, block_timestamp) AS total_supply,
  AVG(gas_price) AS gas_price
FROM
  blocks
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'block_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW chunk_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, included_in_block_timestamp) AS date, -- 1d in ns
  COUNT(*) AS chunks,
  COUNT(DISTINCT shard_id) AS shards,
  SUM(gas_used) AS gas_used
FROM
  chunks
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'chunk_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW transaction_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  COUNT(*) AS txns,
  SUM(receipt_conversion_tokens_burnt) AS tokens_burnt
FROM
  transactions
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'transaction_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW receipt_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, included_in_block_timestamp) AS date, -- 1d in ns
  COUNT(*) AS receipts
FROM
  receipts
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'receipt_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW action_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (
    86400000000000,
    receipt_included_in_block_timestamp
  ) AS date, -- 1d in ns
  SUM((args ->> 'deposit')::NUMERIC) AS deposit,
  COUNT(
    DISTINCT COALESCE(
      receipt_predecessor_account_id,
      receipt_receiver_account_id
    )
  ) AS accounts,
  COUNT(
    DISTINCT CASE
      WHEN action_kind = 'FUNCTION_CALL' THEN receipt_receiver_account_id
    END
  ) AS contracts,
  COUNT(
    DISTINCT CASE
      WHEN action_kind = 'DELEGATE_ACTION' THEN receipt_id
    END
  ) AS meta_txns,
  COUNT(
    DISTINCT CASE
      WHEN action_kind = 'DELEGATE_ACTION' THEN receipt_receiver_account_id
    END
  ) AS meta_accounts,
  COUNT(
    DISTINCT CASE
      WHEN action_kind = 'DELEGATE_ACTION' THEN receipt_predecessor_account_id
    END
  ) AS meta_relayers
FROM
  action_receipt_actions
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'action_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW outcome_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, executed_in_block_timestamp) AS date, -- 1d in ns
  SUM(tokens_burnt) AS tokens_burnt
FROM
  execution_outcomes
GROUP BY
  date
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'outcome_stats',
    start_offset => '259200000000000', -- 3d in ns
    end_offset => '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW tps_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (60000000000, block_timestamp) AS date, -- 1m in ns
  shard_id AS shard,
  COUNT(*) AS txns
FROM
  transactions
GROUP BY
  date,
  shard
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'tps_stats',
    start_offset => '86400000000000', -- 1d in ns
    end_offset => '60000000000', -- 1m in ns
    schedule_interval => INTERVAL '1 minute'
  );

SELECT
  add_retention_policy (
    'tps_stats',
    drop_after => BIGINT '259200000000000' -- 3d in ns
  );
