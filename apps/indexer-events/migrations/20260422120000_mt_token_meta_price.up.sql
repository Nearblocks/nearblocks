ALTER TABLE mt_token_meta
ADD COLUMN IF NOT EXISTS price NUMERIC(32, 12),
ADD COLUMN IF NOT EXISTS refreshed_at TIMESTAMP -- price refreshed;
