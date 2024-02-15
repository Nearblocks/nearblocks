ALTER TABLE nodes
ALTER last_seen TYPE TIMESTAMPTZ,
ALTER bandwidth_download TYPE NUMERIC,
ALTER bandwidth_upload TYPE NUMERIC,
ALTER cpu_usage TYPE NUMERIC,
ALTER boot_time_seconds TYPE TIMESTAMPTZ,
ALTER block_production_tracking_delay TYPE NUMERIC,
ALTER min_block_production_delay TYPE NUMERIC,
ALTER max_block_production_delay TYPE NUMERIC,
ALTER max_block_wait_delay TYPE NUMERIC;
