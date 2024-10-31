ALTER TABLE dex_pairs
ALTER price_token TYPE NUMERIC(40, 12),
ALTER price_usd TYPE NUMERIC(40, 12);

DROP MATERIALIZED VIEW dex_events_1d;

DROP MATERIALIZED VIEW dex_events_1h;

DROP MATERIALIZED VIEW dex_events_1m;

ALTER TABLE dex_events
ALTER price_token TYPE NUMERIC(40, 12),
ALTER price_usd TYPE NUMERIC(40, 12);

CREATE MATERIALIZED VIEW dex_events_1m
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (60, "timestamp") AS bucket_1m,
  pair_id,
  FIRST (price_usd, "timestamp") AS open_usd_1m,
  MAX(price_usd) AS high_usd_1m,
  MIN(price_usd) AS low_usd_1m,
  LAST (price_usd, "timestamp") AS close_usd_1m,
  FIRST (price_token, "timestamp") AS open_token_1m,
  MAX(price_token) AS high_token_1m,
  MIN(price_token) AS low_token_1m,
  LAST (price_token, "timestamp") AS close_token_1m,
  SUM(amount_usd) AS volume_1m
FROM
  dex_events
GROUP BY
  bucket_1m,
  pair_id
ORDER BY
  bucket_1m
WITH
  NO DATA;

CREATE MATERIALIZED VIEW dex_events_1h
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (3600, bucket_1m) AS bucket_1h,
  pair_id,
  FIRST (open_usd_1m, bucket_1m) AS open_usd_1h,
  MAX(high_usd_1m) AS high_usd_1h,
  MIN(low_usd_1m) AS low_usd_1h,
  LAST (close_usd_1m, bucket_1m) AS close_usd_1h,
  FIRST (open_token_1m, bucket_1m) AS open_token_1h,
  MAX(high_token_1m) AS high_token_1h,
  MIN(low_token_1m) AS low_token_1h,
  LAST (close_token_1m, bucket_1m) AS close_token_1h,
  SUM(volume_1m) AS volume_1h
FROM
  dex_events_1m
GROUP BY
  bucket_1h,
  pair_id
ORDER BY
  bucket_1h
WITH
  NO DATA;

CREATE MATERIALIZED VIEW dex_events_1d
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (86400, bucket_1h) AS bucket_1d,
  pair_id,
  FIRST (open_usd_1h, bucket_1h) AS open_usd_1d,
  MAX(high_usd_1h) AS high_usd_1d,
  MIN(low_usd_1h) AS low_usd_1d,
  LAST (close_usd_1h, bucket_1h) AS close_usd_1d,
  FIRST (open_token_1h, bucket_1h) AS open_token_1d,
  MAX(high_token_1h) AS high_token_1d,
  MIN(low_token_1h) AS low_token_1d,
  LAST (close_token_1h, bucket_1h) AS close_token_1d,
  SUM(volume_1h) AS volume_1d
FROM
  dex_events_1h
GROUP BY
  bucket_1d,
  pair_id
ORDER BY
  bucket_1d
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'dex_events_1m',
    start_offset => NULL,
    end_offset => 120,
    schedule_interval => INTERVAL '1 minute'
  );

SELECT
  add_continuous_aggregate_policy (
    'dex_events_1h',
    start_offset => NULL,
    end_offset => 7200,
    schedule_interval => INTERVAL '1 hour'
  );

SELECT
  add_continuous_aggregate_policy (
    'dex_events_1d',
    start_offset => NULL,
    end_offset => 172800,
    schedule_interval => INTERVAL '1 day'
  );
