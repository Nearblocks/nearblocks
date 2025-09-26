DROP INDEX IF EXISTS fe_account_timestamp_idx;

DROP INDEX IF EXISTS fe_account_contract_timestamp_idx;

CREATE INDEX IF NOT EXISTS fe_contract_account_timestamp_idx ON ft_events (
  contract_account_id,
  affected_account_id,
  block_timestamp DESC
);

CREATE INDEX IF NOT EXISTS ne_contract_account_timestamp_idx ON nft_events (
  contract_account_id,
  affected_account_id,
  block_timestamp DESC
);

CREATE INDEX IF NOT EXISTS me_contract_account_timestamp_idx ON mt_events (
  contract_account_id,
  affected_account_id,
  block_timestamp DESC
);

CREATE INDEX IF NOT EXISTS ne_block_timestamp_brin_idx ON nft_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS me_block_timestamp_brin_idx ON mt_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

SELECT
  remove_continuous_aggregate_policy ('ft_contract_stats', if_exists => true);

SELECT
  remove_continuous_aggregate_policy ('ft_account_stats', if_exists => true);

SELECT
  remove_continuous_aggregate_policy ('nft_contract_stats', if_exists => true);

SELECT
  remove_continuous_aggregate_policy ('nft_account_stats', if_exists => true);

SELECT
  add_continuous_aggregate_policy (
    'ft_contract_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

SELECT
  add_continuous_aggregate_policy (
    'ft_account_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

SELECT
  add_continuous_aggregate_policy (
    'nft_contract_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

SELECT
  add_continuous_aggregate_policy (
    'nft_account_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS fas_account_contract_date_idx ON ft_account_stats (account, contract, date DESC);

CREATE INDEX IF NOT EXISTS fas_contract_date_idx ON ft_account_stats (contract, date DESC);

CREATE INDEX IF NOT EXISTS nas_account_contract_date_idx ON nft_account_stats (account, contract, date DESC);

CREATE INDEX IF NOT EXISTS nas_contract_date_idx ON nft_account_stats (contract, date DESC);

-- Script to backfill caggs
-- DO $$
-- DECLARE
--   chunk_interval BIGINT := 2 * 86400000000000; -- 1d in ns
--   start_ts BIGINT;
--   end_ts BIGINT;
--   current_start BIGINT;
--   current_end BIGINT;
-- BEGIN
--   SELECT min(block_timestamp), max(block_timestamp)
--   INTO start_ts, end_ts
--   FROM ft_events;
--   RAISE NOTICE 'Backfilling from % to %', start_ts, end_ts;
--   current_start := start_ts;
--   WHILE current_start < end_ts LOOP
--     current_end := current_start + chunk_interval;
--     IF current_end > end_ts THEN
--       current_end := end_ts;
--     END IF;
--     RAISE NOTICE 'Refreshing window: % to %', current_start, current_end;
--     CALL refresh_continuous_aggregate('ft_account_stats', current_start, current_end);
--     PERFORM pg_sleep(3);
--     current_start := current_start + chunk_interval;
--   END LOOP;
--   RAISE NOTICE 'Backfill complete.';
-- END $$;
