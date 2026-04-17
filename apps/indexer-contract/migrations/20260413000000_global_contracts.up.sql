ALTER TABLE contract_code_events
ADD COLUMN global_code_hash TEXT;

ALTER TABLE contract_code_events
ADD COLUMN global_account_id TEXT;
