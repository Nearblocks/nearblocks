CREATE MATERIALIZED VIEW IF NOT EXISTS account_txn_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, t.block_timestamp) AS date, -- 1d in ns
  u.account AS account,
  COUNT(DISTINCT t.transaction_hash) AS txns
FROM
  transactions t
  CROSS JOIN LATERAL (
    SELECT
      t.signer_account_id AS account,
      1::SMALLINT AS dir,
      t.receiver_account_id AS counterparty
    UNION ALL
    SELECT
      t.receiver_account_id AS account,
      2::SMALLINT AS dir,
      t.signer_account_id AS counterparty
    WHERE
      t.receiver_account_id <> t.signer_account_id
  ) AS u
GROUP BY
  1,
  2
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_txn_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_ats_account_idx ON account_txn_stats (account);
