CREATE INDEX IF NOT EXISTS t_fte_receipt_id_idx ON ft_events (receipt_id);

CREATE INDEX IF NOT EXISTS t_nfte_receipt_id_idx ON nft_events (receipt_id);
