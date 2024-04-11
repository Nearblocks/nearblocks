CREATE TABLE ft_holders (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  amount NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE TABLE nft_holders (
  contract TEXT NOT NULL,
  token TEXT NOT NULL,
  account TEXT NOT NULL,
  quantity NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, token, account)
);
