CREATE TABLE IF NOT EXISTS mt_holders (
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, token, account)
);

CREATE INDEX IF NOT EXISTS mh_account_amount_desc ON mt_holders (account, amount DESC);

CREATE INDEX IF NOT EXISTS mh_contract_amount_desc ON mt_holders (contract, amount DESC, account ASC);

CREATE INDEX IF NOT EXISTS fh_contract_amount_desc ON ft_holders (contract, amount DESC, account ASC);
