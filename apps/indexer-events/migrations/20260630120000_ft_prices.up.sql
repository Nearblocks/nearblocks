ALTER TABLE mt_intents_tokens
ADD COLUMN IF NOT EXISTS coingecko_id TEXT;

DROP TABLE IF EXISTS ft_prices;

DROP TABLE IF EXISTS mt_prices;

DROP TABLE IF EXISTS mt_intents_prices;

CREATE TABLE IF NOT EXISTS ft_prices (
  coingecko_id TEXT NOT NULL,
  date BIGINT NOT NULL, -- timestamp ms
  price NUMERIC(32, 12) NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (coingecko_id, date)
);

SELECT
  create_hypertable (
    'ft_prices',
    by_range ('date', BIGINT '86400000'), -- 1d in ms
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'ft_prices',
    'epoch_milli_seconds',
    replace_if_exists => true
  );

SELECT
  add_retention_policy (
    'ft_prices',
    drop_after => BIGINT '259200000', -- 3d in ms
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS fp_date_brin_idx ON ft_prices USING BRIN (date)
WITH
  (pages_per_range = 32);

CREATE TABLE IF NOT EXISTS ft_prices_daily (
  coingecko_id TEXT NOT NULL,
  date BIGINT NOT NULL, -- start of day epoch ms
  price NUMERIC(32, 12) NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (coingecko_id, date)
);

CREATE INDEX IF NOT EXISTS fpd_date_idx ON ft_prices_daily (date);
