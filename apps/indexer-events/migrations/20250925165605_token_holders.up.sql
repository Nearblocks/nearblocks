CREATE TABLE IF NOT EXISTS ft_holders (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE INDEX IF NOT EXISTS fh_account_amount_desc ON ft_holders (account, amount DESC);

CREATE TABLE IF NOT EXISTS nft_holders (
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  account TEXT NOT NULL,
  quantity NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, token, account)
);

CREATE INDEX IF NOT EXISTS nh_account_quantity_gtz ON nft_holders (account, quantity);
