CREATE INDEX CONCURRENTLY t_fte_block_height_idx ON ft_events (block_height);

CREATE INDEX CONCURRENTLY t_nfte_block_height_idx ON nft_events (block_height);
