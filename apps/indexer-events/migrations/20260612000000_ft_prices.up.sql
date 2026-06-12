CREATE TABLE IF NOT EXISTS ft_prices (
  contract TEXT NOT NULL,
  date BIGINT NOT NULL,
  price NUMERIC(32, 12) NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (contract, date)
);

SELECT
  create_hypertable (
    'ft_prices',
    by_range ('date', BIGINT '2592000000'), -- 30d in ms
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'ft_prices',
    'epoch_milli_seconds',
    replace_if_exists => true
  );

CREATE INDEX IF NOT EXISTS fp_date_brin_idx ON ft_prices USING BRIN (date)
WITH
  (pages_per_range = 32);

CREATE TABLE IF NOT EXISTS mt_prices (
  token TEXT NOT NULL,
  date BIGINT NOT NULL,
  price NUMERIC(32, 12) NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (token, date)
);

SELECT
  create_hypertable (
    'mt_prices',
    by_range ('date', BIGINT '2592000000'), -- 30d in ms
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'mt_prices',
    'epoch_milli_seconds',
    replace_if_exists => true
  );

CREATE INDEX IF NOT EXISTS mp_date_brin_idx ON mt_prices USING BRIN (date)
WITH
  (pages_per_range = 32);

ALTER TABLE mt_intents_tokens
ALTER COLUMN contract
DROP NOT NULL;
