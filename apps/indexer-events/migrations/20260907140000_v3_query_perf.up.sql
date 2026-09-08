CREATE INDEX IF NOT EXISTS fe_receipt_id_idx ON ft_events (receipt_id);

CREATE INDEX IF NOT EXISTS me_receipt_id_idx ON mt_events (receipt_id);

CREATE INDEX IF NOT EXISTS ne_receipt_id_idx ON nft_events (receipt_id);

CREATE TABLE IF NOT EXISTS nft_account_holders (
  contract TEXT NOT NULL,
  account TEXT NOT NULL,
  quantity NUMERIC(40) NOT NULL,
  PRIMARY KEY (contract, account)
);

CREATE INDEX IF NOT EXISTS nah_contract_quantity_desc ON nft_account_holders (contract, quantity DESC, account ASC);
