CREATE TABLE derived_addresses (
  derived_address TEXT NOT NULL,
  account_id TEXT NOT NULL,
  chain TEXT NOT NULL,
  PRIMARY KEY (derived_address, account_id)
);

CREATE INDEX da_derived_address_account_id_idx ON derived_addresses USING btree (derived_address, account_id);
