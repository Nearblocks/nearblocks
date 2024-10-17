CREATE INDEX IF NOT EXISTS be_block_height_idx ON balance_events (block_height);

CREATE TABLE account_stats (
  id BIGSERIAL NOT NULL,
  account TEXT NOT NULL,
  txns_fee NUMERIC(40),
  txns BIGINT NOT NULL,
  txns_in BIGINT NOT NULL,
  txns_out BIGINT NOT NULL,
  receipts BIGINT NOT NULL,
  receipts_in BIGINT NOT NULL,
  receipts_out BIGINT NOT NULL,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (account, date)
);

CREATE INDEX as_account_idx ON account_stats (account);

CREATE TABLE account_near_stats (
  id BIGSERIAL NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40),
  amount_staked NUMERIC(40),
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (account, date)
);

CREATE INDEX ans_account_idx ON account_near_stats (account);

CREATE TABLE account_ft_stats (
  id BIGSERIAL NOT NULL,
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  delta_amount NUMERIC(40),
  amount_in NUMERIC(40),
  amount_out NUMERIC(40),
  txns BIGINT NOT NULL,
  txns_in BIGINT NOT NULL,
  txns_out BIGINT NOT NULL,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (contract, account, date)
);

CREATE INDEX afs_account_idx ON account_ft_stats (account);

CREATE TABLE ft_stats (
  id BIGSERIAL NOT NULL,
  contract TEXT NOT NULL,
  amount NUMERIC(40),
  txns BIGINT,
  senders BIGINT,
  receivers BIGINT,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (contract, date)
);

CREATE INDEX fs_contract_idx ON ft_stats (contract);
