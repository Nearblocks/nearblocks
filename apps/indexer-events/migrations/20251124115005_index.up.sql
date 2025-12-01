CREATE INDEX IF NOT EXISTS fe_affected_contract_idx ON ft_events (affected_account_id, contract_account_id);

CREATE INDEX IF NOT EXISTS ne_affected_contract_idx ON nft_events (affected_account_id, contract_account_id);
