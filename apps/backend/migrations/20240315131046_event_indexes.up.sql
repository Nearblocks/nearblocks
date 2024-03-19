CREATE INDEX CONCURRENTLY IF NOT EXISTS t_fte_contract_account_id_event_index_idx ON ft_events (contract_account_id, event_index DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS t_fte_affected_account_id_event_index_idx ON ft_events (affected_account_id, event_index DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS t_fte_block_height_idx ON ft_events (block_height);

CREATE INDEX CONCURRENTLY IF NOT EXISTS t_nfte_contract_account_id_event_index_idx ON nft_events (contract_account_id, event_index DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS t_nfte_affected_account_id_event_index_idx ON nft_events (affected_account_id, event_index DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS t_nfte_block_height_idx ON nft_events (block_height);
