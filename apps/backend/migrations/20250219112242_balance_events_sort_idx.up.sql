CREATE INDEX IF NOT EXISTS be_affected_account_id_event_index_desc ON balance_events (affected_account_id, event_index DESC);

DROP INDEX IF EXISTS be_affected_account_id_block_height_desc;
