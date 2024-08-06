CREATE TABLE contracts (
  contract TEXT NOT NULL,
  hash TEXT NOT NULL,
  TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contract)
);

CREATE INDEX contract_idx ON contracts USING BTREE (contract);
