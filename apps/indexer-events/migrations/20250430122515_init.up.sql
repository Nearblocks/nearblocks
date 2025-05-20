CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$ -- epoch in ns
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE ft_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  event_index INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  event_type SMALLINT NOT NULL,
  delta_amount NUMERIC(40) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  standard TEXT NOT NULL,
  cause TEXT NOT NULL,
  involved_account_id TEXT,
  event_memo TEXT
);

SELECT
  create_hypertable (
    'ft_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('ft_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX fe_shard_type_index_uidx ON ft_events (
  block_timestamp DESC,
  shard_id DESC,
  event_type DESC,
  event_index DESC
);

CREATE INDEX fe_block_timestamp_brin_idx ON ft_events USING BRIN (block_timestamp)
WITH
  (pages_per_range = 32);

CREATE INDEX fe_account_timestamp_idx ON ft_events (affected_account_id, block_timestamp);

CREATE INDEX fe_account_contract_timestamp_idx ON ft_events (
  affected_account_id,
  contract_account_id,
  block_timestamp
);

CREATE INDEX fe_contract_sort_idx ON ft_events (
  contract_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_type DESC,
  event_index DESC
);

CREATE INDEX fe_account_sort_idx ON ft_events (
  affected_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_type DESC,
  event_index DESC
);

CREATE MATERIALIZED VIEW ft_contract_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  contract_account_id AS contract,
  SUM(delta_amount) AS net_delta, -- for ft_supply
  SUM(
    CASE
      WHEN cause = 'MINT' THEN delta_amount
      WHEN cause = 'BURN' THEN ABS(delta_amount)
      WHEN cause = 'TRANSFER'
      AND delta_amount > 0 THEN delta_amount
      ELSE 0
    END
  ) AS transfers_amount,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers_count,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS unique_receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS unique_senders,
  COUNT(DISTINCT affected_account_id) AS unique_accounts
FROM
  ft_events
GROUP BY
  date,
  contract
ORDER BY
  date,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_contract_stats',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW ft_account_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  contract_account_id AS contract,
  SUM(delta_amount) AS net_delta, -- for ft_holders
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount < 0 THEN ABS(delta_amount)
        ELSE 0
      END
    ),
    0
  ) AS sent_amount,
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount > 0 THEN delta_amount
        ELSE 0
      END
    ),
    0
  ) AS received_amount,
  COUNT(*) AS total_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
  ) AS inbound_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount < 0
  ) AS outbound_transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_sent,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_received
FROM
  ft_events
GROUP BY
  date,
  account,
  contract
ORDER BY
  date,
  account,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_account_stats',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE TABLE nft_events (
  block_timestamp BIGINT NOT NULL,
  block_height BIGINT NOT NULL,
  event_index INT NOT NULL,
  shard_id SMALLINT NOT NULL,
  delta_amount SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  standard TEXT NOT NULL,
  cause TEXT NOT NULL,
  involved_account_id TEXT,
  authorized_account_id TEXT,
  event_memo TEXT
);

SELECT
  create_hypertable (
    'nft_events',
    by_range ('block_timestamp', BIGINT '2592000000000000'), -- 30d in ns
    create_default_indexes => false
  );

SELECT
  set_integer_now_func ('nft_events', 'epoch_nano_seconds');

CREATE UNIQUE INDEX ne_shard_index_uidx ON nft_events (
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX ne_contract_sort_idx ON nft_events (
  contract_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX ne_contract_token_sort_idx ON nft_events (
  contract_account_id,
  token_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE INDEX ne_account_sort_idx ON nft_events (
  affected_account_id,
  block_timestamp DESC,
  shard_id DESC,
  event_index DESC
);

CREATE MATERIALIZED VIEW nft_contract_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  contract_account_id AS contract,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers_count,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS unique_receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS unique_senders,
  COUNT(DISTINCT affected_account_id) AS unique_accounts
FROM
  nft_events
GROUP BY
  date,
  contract
ORDER BY
  date,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_contract_stats',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW nft_account_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  contract_account_id AS contract,
  token_id AS token,
  SUM(delta_amount) AS net_delta, -- for nft_holders
  COUNT(*) AS total_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
  ) AS inbound_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount < 0
  ) AS outbound_transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_sent,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_received
FROM
  nft_events
GROUP BY
  date,
  account,
  contract,
  token
ORDER BY
  date,
  account,
  contract,
  token
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_account_stats',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour'
  );

CREATE TABLE ft_meta (
  decimals SMALLINT,
  price NUMERIC(28, 8),
  market_cap NUMERIC(36, 8),
  fully_diluted_market_cap NUMERIC(36, 8),
  total_supply NUMERIC,
  circulating_supply NUMERIC,
  contract TEXT NOT NULL,
  hex_address TEXT,
  name TEXT,
  symbol TEXT,
  icon TEXT,
  spec TEXT,
  reference TEXT,
  reference_hash TEXT,
  description TEXT,
  website TEXT,
  twitter TEXT,
  facebook TEXT,
  telegram TEXT,
  reddit TEXT,
  coingecko_id TEXT,
  coinmarketcap_id TEXT,
  modified_at TIMESTAMP, -- meta updated
  refreshed_at TIMESTAMP, -- price refreshed
  synced_at TIMESTAMP, -- supply synced
  searched_at TIMESTAMP, -- market searched
  PRIMARY KEY (contract),
  UNIQUE (hex_address)
);

CREATE INDEX fm_modified_idx ON ft_meta (modified_at);

CREATE INDEX fm_refreshed_at_idx ON ft_meta (refreshed_at);

CREATE INDEX fm_synced_at_idx ON ft_meta (synced_at);

CREATE INDEX fm_searched_at_idx ON ft_meta (searched_at);

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
  modified_at TIMESTAMP, -- meta updated
  PRIMARY KEY (contract)
);

CREATE INDEX nm_modified_idx ON nft_meta (modified_at);

CREATE TABLE nft_token_meta (
  issued_at BIGINT,
  expires_at BIGINT,
  starts_at BIGINT,
  updated_at BIGINT,
  copies INTEGER,
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  title TEXT,
  description TEXT,
  media TEXT,
  media_hash TEXT,
  extra TEXT,
  reference TEXT,
  reference_hash TEXT,
  modified_at TIMESTAMP, -- meta updated
  PRIMARY KEY (contract, token)
);

CREATE INDEX ntm_modified_idx ON nft_token_meta (modified_at);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);
