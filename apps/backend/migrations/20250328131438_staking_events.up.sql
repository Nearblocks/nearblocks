CREATE TYPE staking_event_type AS ENUM(
  'DEPOSIT',
  'WITHDRAW',
  'STAKE',
  'UNSTAKE',
  'CONTRACT',
  'REWARD'
);

CREATE TABLE staking_events (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  epoch_id TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  contract TEXT NOT NULL,
  account TEXT,
  type staking_event_type,
  amount NUMERIC(40),
  delta_shares NUMERIC(40),
  absolute_shares NUMERIC(40),
  absolute_unstaked_amount NUMERIC(40),
  contract_staked NUMERIC(40),
  contract_shares NUMERIC(40),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE INDEX se_epoch_id_idx ON staking_events USING btree (epoch_id);

CREATE INDEX se_receipt_id_idx ON staking_events USING btree (receipt_id);

CREATE INDEX se_block_height_idx ON staking_events USING btree (block_height DESC);

CREATE INDEX se_block_timestamp_idx ON staking_events USING btree (block_timestamp DESC);

CREATE INDEX se_contract_idx ON staking_events USING btree (contract);

CREATE INDEX se_account_idx ON staking_events USING btree (account)
WHERE
  account IS NOT NULL;

CREATE INDEX se_type_idx ON staking_events USING btree (type);
