CREATE MATERIALIZED VIEW IF NOT EXISTS account_receipt_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, r.included_in_block_timestamp) AS date, -- 1d in ns
  u.account AS account,
  COUNT(DISTINCT r.originated_from_transaction_hash) AS txns,
  COUNT(DISTINCT u.counterparty) FILTER (
    WHERE
      u.dir = 1
      AND u.counterparty <> u.account
  ) AS unique_address_out,
  COUNT(DISTINCT u.counterparty) FILTER (
    WHERE
      u.dir = 2
      AND u.counterparty <> u.account
  ) AS unique_address_in
FROM
  receipts r
  CROSS JOIN LATERAL (
    SELECT
      r.predecessor_account_id AS account,
      1::SMALLINT AS dir,
      r.receiver_account_id AS counterparty
    UNION ALL
    SELECT
      r.receiver_account_id AS account,
      2::SMALLINT AS dir,
      r.predecessor_account_id AS counterparty
    WHERE
      r.receiver_account_id <> r.predecessor_account_id
  ) AS u
GROUP BY
  1,
  2
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_receipt_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE MATERIALIZED VIEW IF NOT EXISTS account_near_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (
    86400000000000,
    receipt_included_in_block_timestamp
  ) AS date, -- 1d in ns
  u.account AS account,
  SUM(u.amount) FILTER (
    WHERE
      u.dir = 1
  ) AS amount_out,
  SUM(u.amount) FILTER (
    WHERE
      u.dir = 2
  ) AS amount_in
FROM
  action_receipt_actions
  CROSS JOIN LATERAL (
    SELECT
      receipt_predecessor_account_id AS account,
      (args ->> 'deposit')::NUMERIC AS amount,
      1::SMALLINT AS dir
    WHERE
      action_kind IN ('TRANSFER', 'FUNCTION_CALL')
      AND (args ->> 'deposit') IS NOT NULL
      AND (args ->> 'deposit') != '0'
    UNION ALL
    SELECT
      receipt_receiver_account_id AS account,
      (args ->> 'deposit')::NUMERIC AS amount,
      2::SMALLINT AS dir
    WHERE
      action_kind IN ('TRANSFER', 'FUNCTION_CALL')
      AND (args ->> 'deposit') IS NOT NULL
      AND (args ->> 'deposit') != '0'
  ) AS u
GROUP BY
  1,
  2
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_near_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );
