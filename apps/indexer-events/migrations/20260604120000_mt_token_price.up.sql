CREATE
OR REPLACE FUNCTION epoch_milli_seconds () RETURNS BIGINT AS $$ -- epoch in ms
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE IF NOT EXISTS mt_intents_tokens (
  token TEXT NOT NULL,
  contract TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  decimals SMALLINT NOT NULL,
  PRIMARY KEY (token)
);

CREATE TABLE IF NOT EXISTS mt_intents_prices (
  updated_at BIGINT NOT NULL, -- epoch ms
  price NUMERIC(32, 12) NOT NULL,
  token TEXT NOT NULL
);

SELECT
  create_hypertable (
    'mt_intents_prices',
    by_range ('updated_at', BIGINT '2592000000'), -- 30d in ms
    create_default_indexes => false,
    if_not_exists => true
  );

SELECT
  set_integer_now_func (
    'mt_intents_prices',
    'epoch_milli_seconds',
    replace_if_exists => true
  );

CREATE UNIQUE INDEX IF NOT EXISTS mip_token_updated_uidx ON mt_intents_prices (token, updated_at DESC);

CREATE INDEX IF NOT EXISTS mip_updated_brin_idx ON mt_intents_prices USING BRIN (updated_at)
WITH
  (pages_per_range = 32);
