CREATE TABLE IF NOT EXISTS validator_config (
  id INT PRIMARY KEY DEFAULT 1,
  latest_block_height BIGINT,
  latest_block_timestamp BIGINT,
  genesis_account_count TEXT,
  genesis_height BIGINT,
  genesis_min_stake_ratio JSONB,
  genesis_protocol_version INT,
  genesis_timestamp BIGINT,
  genesis_total_supply TEXT,
  protocol_epoch_length INT,
  protocol_max_seats INT,
  protocol_version INT,
  protocol_max_inflation_rate JSONB,
  protocol_treasury_fraction JSONB,
  epoch_start_height BIGINT,
  epoch_start_timestamp BIGINT,
  epoch_start_total_supply TEXT,
  epoch_seat_price TEXT,
  total_stake TEXT,
  network_holder_index INT,
  last_epoch_apy TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO
  validator_config (id)
VALUES
  (1)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS validator_epoch_data (
  account_id TEXT PRIMARY KEY,
  public_key TEXT,
  current_epoch_stake TEXT,
  current_epoch_blocks_produced INT,
  current_epoch_blocks_expected INT,
  current_epoch_chunks_produced INT,
  current_epoch_chunks_expected INT,
  next_epoch_stake TEXT,
  after_next_epoch_stake TEXT,
  contract_stake TEXT,
  delegators_count INT,
  fee_numerator INT,
  fee_denominator INT,
  staking_status TEXT,
  own_stake_percent TEXT,
  cumulative_stake_percent TEXT,
  accumulated_stake_percent TEXT,
  stake_change_symbol TEXT,
  stake_change_value TEXT,
  is_network_holder_warning BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validator_pool_metadata (
  account_id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  city TEXT,
  country TEXT,
  country_code TEXT,
  discord TEXT,
  email TEXT,
  github TEXT,
  logo TEXT,
  telegram TEXT,
  twitter TEXT,
  url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
