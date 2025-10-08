ALTER TABLE balance_events
SET
  (
    timescaledb.compress = TRUE,
    timescaledb.compress_orderby = 'block_timestamp DESC, shard_id DESC, index_in_chunk DESC'
  );

SELECT
  add_compression_policy ('balance_events', BIGINT '3196800000000000'); -- 37d in ns
