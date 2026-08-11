CREATE TABLE tvl_sources (
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  start_block BIGINT,
  PRIMARY KEY (protocol, chain)
);

CREATE TABLE tvl_tokens (
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL,
  token TEXT NOT NULL,
  symbol TEXT,
  decimals INT,
  coingecko_id TEXT,
  first_seen_block BIGINT,
  first_seen_date BIGINT,
  PRIMARY KEY (protocol, chain, token)
);

CREATE INDEX tvl_tokens_cg_idx ON tvl_tokens (coingecko_id)
WHERE
  coingecko_id IS NOT NULL;

CREATE TABLE tvl_balances_daily (
  date BIGINT NOT NULL,
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL,
  token TEXT NOT NULL,
  amount NUMERIC(40, 0) NOT NULL,
  PRIMARY KEY (date, protocol, chain, token)
);

SELECT
  create_hypertable (
    'tvl_balances_daily',
    by_range ('date', BIGINT '2592000000'), -- 30d in ms
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('tvl_balances_daily', 'epoch_milli_seconds');

CREATE INDEX tvl_balances_daily_date_idx ON tvl_balances_daily (date);

CREATE TABLE tvl_stats_daily (
  date BIGINT NOT NULL,
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL,
  token TEXT NOT NULL,
  amount NUMERIC(40, 0) NOT NULL,
  price NUMERIC(32, 12),
  amount_usd NUMERIC(40, 12),
  PRIMARY KEY (date, protocol, chain, token)
);

SELECT
  create_hypertable (
    'tvl_stats_daily',
    by_range ('date', BIGINT '2592000000'), -- 30d in ms
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('tvl_stats_daily', 'epoch_milli_seconds');

CREATE INDEX tvl_stats_daily_date_idx ON tvl_stats_daily (date);

CREATE TABLE tvl_daily_blocks (
  chain TEXT NOT NULL,
  date BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  PRIMARY KEY (chain, date)
);

INSERT INTO
  tvl_sources (protocol, chain, address)
VALUES
  (
    'omni-bridge',
    'ethereum',
    '0xe00c629afaccb0510995a2b95560e446a24c85b9'
  ),
  (
    'omni-bridge',
    'arbitrum',
    '0xd025b38762b4a4e36f0cde483b86cb13ea00d989'
  ),
  (
    'omni-bridge',
    'base',
    '0xd025b38762b4a4e36f0cde483b86cb13ea00d989'
  ),
  (
    'omni-bridge',
    'polygon',
    '0xd025b38762b4a4e36f0cde483b86cb13ea00d989'
  ),
  (
    'omni-bridge',
    'bsc',
    '0x073c8a225c8cf9d3f9157f5c1a1dbe02407f5720'
  ),
  ('omni-bridge', 'near', 'omni.bridge.near'),
  (
    'omni-bridge',
    'solana',
    'dahPEoZGXfyV58JqqH85okdHmpN8U2q8owgPUXSCPxe'
  )
ON CONFLICT (protocol, chain) DO NOTHING;
