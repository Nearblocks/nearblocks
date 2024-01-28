CREATE TABLE daily_stats (
  date DATE NOT NULL,
  near_price NUMERIC(28, 8),
  market_cap NUMERIC(28, 8),
  total_supply NUMERIC(45, 0),
  circulating_supply NUMERIC(45, 0),
  blocks BIGINT,
  gas_fee NUMERIC(45, 8),
  gas_used NUMERIC(45, 8),
  txns BIGINT,
  txn_volume NUMERIC(45, 8),
  txn_volume_usd NUMERIC(28, 8),
  txn_fee NUMERIC(45, 8),
  txn_fee_usd NUMERIC(28, 8),
  new_accounts BIGINT,
  active_accounts BIGINT,
  deleted_accounts BIGINT,
  new_contracts BIGINT,
  active_contracts BIGINT,
  unique_contracts BIGINT,
  PRIMARY KEY (date)
);

CREATE TABLE deployed_contracts (
  receipt_id TEXT NOT NULL,
  contract TEXT NOT NULL,
  code_sha256 TEXT NOT NULL,
  block_hash TEXT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (receipt_id)
);

CREATE TABLE errored_contracts (
  id SERIAL NOT NULL,
  contract TEXT NOT NULL,
  type TEXT NOT NULL,
  token TEXT,
  attempts SMALLINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (contract, type),
  UNIQUE (contract, type, token)
);

CREATE TABLE ft_meta (
  contract TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL,
  icon TEXT,
  spec TEXT,
  reference TEXT,
  reference_hash TEXT,
  price NUMERIC(28, 8),
  price_btc NUMERIC(28, 8),
  price_eth NUMERIC(28, 8),
  change_24 NUMERIC(28, 8),
  market_cap NUMERIC(36, 8),
  fully_diluted_market_cap NUMERIC(36, 8),
  total_supply NUMERIC(36, 8),
  circulating_supply NUMERIC(36, 8),
  volume_24h NUMERIC(28, 8),
  description TEXT,
  twitter TEXT,
  facebook TEXT,
  telegram TEXT,
  reddit TEXT,
  website TEXT,
  coingecko_id TEXT,
  coinmarketcap_id TEXT,
  livecoinwatch_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  synced_at TIMESTAMP,
  searched_at TIMESTAMP,
  refreshed_at TIMESTAMP,
  PRIMARY KEY (contract)
);

CREATE TABLE nft_meta (
  contract TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  icon TEXT,
  spec TEXT,
  base_uri TEXT,
  reference TEXT,
  reference_hash TEXT,
  description TEXT,
  twitter TEXT,
  facebook TEXT,
  telegram TEXT,
  reddit TEXT,
  website TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  refreshed_at TIMESTAMP,
  PRIMARY KEY (contract)
);

CREATE TABLE nft_token_meta (
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  title TEXT,
  description TEXT,
  media TEXT,
  media_hash TEXT,
  copies INTEGER,
  issued_at BIGINT,
  expires_at BIGINT,
  starts_at BIGINT,
  updated_at BIGINT,
  extra TEXT,
  reference TEXT,
  reference_hash TEXT,
  PRIMARY KEY (contract, token)
);

CREATE TABLE stats (
  id SERIAL NOT NULL,
  total_supply NUMERIC(45, 0),
  circulating_supply NUMERIC(45, 0),
  avg_block_time NUMERIC(28, 8),
  gas_price NUMERIC(20, 0),
  nodes_online INTEGER,
  near_price NUMERIC(28, 8),
  near_btc_price NUMERIC(28, 8),
  market_cap NUMERIC(28, 8),
  volume NUMERIC(28, 8),
  high_24h NUMERIC(28, 8),
  high_all NUMERIC(28, 8),
  low_24h NUMERIC(28, 8),
  low_all NUMERIC(28, 8),
  change_24 NUMERIC(28, 8),
  total_txns NUMERIC(20, 0),
  PRIMARY KEY (id)
);

CREATE INDEX dc_block_timestamp_idx ON deployed_contracts USING btree (block_timestamp);
