ALTER TABLE validator_config
ADD COLUMN IF NOT EXISTS protocol_min_stake_ratio JSONB;
