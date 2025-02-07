CREATE INDEX IF NOT EXISTS be_affected_account_id_block_height_desc ON balance_events (affected_account_id, block_height DESC);

CREATE TABLE ft_holders_new (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE INDEX IF NOT EXISTS fhn_account_amount_desc ON ft_holders_new (account, amount DESC);

CREATE TABLE nft_holders_new (
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  account TEXT NOT NULL,
  quantity NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, token, account)
);

CREATE INDEX IF NOT EXISTS nhn_account_quantity_gtz ON nft_holders_new (account, quantity)
WHERE
  quantity > 0;

CREATE TABLE account_stats_new (
  id BIGSERIAL NOT NULL,
  account TEXT NOT NULL,
  txns_fee NUMERIC(40) NOT NULL DEFAULT 0,
  txns INT NOT NULL DEFAULT 0,
  txns_in INT NOT NULL DEFAULT 0,
  txns_out INT NOT NULL DEFAULT 0,
  receipts INT NOT NULL DEFAULT 0,
  receipts_in INT NOT NULL DEFAULT 0,
  receipts_out INT NOT NULL DEFAULT 0,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (account, date)
);

CREATE INDEX asn_account_idx ON account_stats_new (account);

CREATE TABLE account_near_stats_new (
  id BIGSERIAL NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL DEFAULT 0,
  amount_staked NUMERIC(40) NOT NULL DEFAULT 0,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (account, date)
);

CREATE INDEX ansn_account_idx ON account_near_stats_new (account);

CREATE TABLE account_ft_stats_new (
  id BIGSERIAL NOT NULL,
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  delta_amount NUMERIC(40) NOT NULL DEFAULT 0,
  amount_in NUMERIC(40) NOT NULL DEFAULT 0,
  amount_out NUMERIC(40) NOT NULL DEFAULT 0,
  txns INT NOT NULL DEFAULT 0,
  txns_in INT NOT NULL DEFAULT 0,
  txns_out INT NOT NULL DEFAULT 0,
  date DATE,
  PRIMARY KEY (id),
  UNIQUE (contract, account, date)
);

CREATE INDEX afsn_account_idx ON account_ft_stats_new (account);
