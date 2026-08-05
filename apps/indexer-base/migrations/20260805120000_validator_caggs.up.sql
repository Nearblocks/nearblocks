CREATE MATERIALIZED VIEW IF NOT EXISTS validator_block_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, block_timestamp) AS date, -- 1d in ns
  author_account_id AS author,
  COUNT(*) AS blocks
FROM
  blocks
GROUP BY
  1,
  2
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'validator_block_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_vbs_author_idx ON validator_block_stats (author);

CREATE MATERIALIZED VIEW IF NOT EXISTS validator_chunk_stats
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400000000000, included_in_block_timestamp) AS date, -- 1d in ns
  author_account_id AS author,
  COUNT(*) AS chunks
FROM
  chunks
GROUP BY
  1,
  2
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'validator_chunk_stats',
    start_offset => '259200000000000', -- 3d
    end_offset => '3600000000000', -- 1h
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_vcs_author_idx ON validator_chunk_stats (author);
