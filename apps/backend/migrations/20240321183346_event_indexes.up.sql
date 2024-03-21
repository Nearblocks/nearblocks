CREATE INDEX IF NOT EXISTS t_fte_event_index_desc_idx ON ft_events (event_index DESC);

CREATE INDEX IF NOT EXISTS t_fte_block_timestamp_idx ON ft_events (block_timestamp DESC);

CREATE INDEX IF NOT EXISTS t_nfte_event_index_desc_idx ON nft_events (event_index DESC);

CREATE INDEX IF NOT EXISTS t_nfte_block_timestamp_idx ON nft_events (block_timestamp DESC);
