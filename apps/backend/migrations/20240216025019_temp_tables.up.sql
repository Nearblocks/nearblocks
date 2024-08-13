CREATE TABLE temp_access_keys (
  public_key TEXT NOT NULL,
  account_id TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  created_by_block_height NUMERIC(20, 0) NOT NULL,
  deleted_by_block_height NUMERIC(20, 0),
  permission_kind access_key_permission_kind,
  PRIMARY KEY (public_key, account_id)
);

CREATE TABLE temp_accounts (
  account_id TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  created_by_block_height NUMERIC(20, 0) NOT NULL,
  deleted_by_block_height NUMERIC(20, 0),
  PRIMARY KEY (account_id)
);

CREATE TABLE temp_action_receipt_actions (
  receipt_id TEXT NOT NULL,
  index_in_action_receipt INTEGER NOT NULL,
  receipt_predecessor_account_id TEXT NOT NULL,
  receipt_receiver_account_id TEXT NOT NULL,
  action_kind action_kind NOT NULL,
  args JSONB NOT NULL,
  receipt_included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (receipt_id, index_in_action_receipt)
);

CREATE TABLE temp_action_receipt_output_data (
  output_data_id TEXT NOT NULL,
  output_from_receipt_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  PRIMARY KEY (output_data_id, output_from_receipt_id)
);

CREATE TABLE temp_blocks (
  block_height NUMERIC(20, 0) NOT NULL,
  block_hash TEXT NOT NULL,
  prev_block_hash TEXT NOT NULL,
  total_supply NUMERIC(45, 0) NOT NULL,
  gas_price NUMERIC(45, 0) NOT NULL,
  author_account_id TEXT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (block_hash)
);

CREATE TABLE temp_chunks (
  included_in_block_hash TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,
  shard_id NUMERIC(20, 0) NOT NULL,
  gas_limit NUMERIC(20, 0) NOT NULL,
  gas_used NUMERIC(20, 0) NOT NULL,
  author_account_id TEXT NOT NULL,
  included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (chunk_hash)
);

CREATE TABLE temp_execution_outcomes (
  receipt_id TEXT NOT NULL,
  executed_in_block_hash TEXT NOT NULL,
  shard_id NUMERIC(20, 0) NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  gas_burnt NUMERIC(20, 0) NOT NULL,
  tokens_burnt NUMERIC(45, 0) NOT NULL,
  executor_account_id TEXT NOT NULL,
  status execution_outcome_status NOT NULL,
  executed_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (receipt_id)
);

CREATE TABLE temp_execution_outcome_receipts (
  executed_receipt_id TEXT NOT NULL,
  index_in_execution_outcome INTEGER NOT NULL,
  produced_receipt_id TEXT NOT NULL,
  PRIMARY KEY (
    executed_receipt_id,
    index_in_execution_outcome,
    produced_receipt_id
  )
);

CREATE TABLE temp_receipts (
  id BIGSERIAL,
  receipt_id TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_kind receipt_kind NOT NULL,
  originated_from_transaction_hash TEXT NOT NULL,
  included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (receipt_id)
);

CREATE TABLE temp_transactions (
  id BIGSERIAL,
  transaction_hash TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  signer_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  status execution_outcome_status NOT NULL,
  converted_into_receipt_id TEXT NOT NULL,
  receipt_conversion_gas_burnt NUMERIC(20, 0),
  receipt_conversion_tokens_burnt NUMERIC(45, 0),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (transaction_hash)
);

CREATE INDEX t_ak_account_id_idx ON temp_access_keys USING btree (account_id);

CREATE INDEX t_ak_public_key_idx ON temp_access_keys USING btree (public_key);

CREATE INDEX t_ak_account_id_created_by_block_height_block_timestamp_idx ON temp_access_keys USING btree (
  account_id,
  created_by_block_height DESC,
  deleted_by_block_height DESC
);

CREATE INDEX t_a_account_id_created_by_block_height_block_timestamp_idx ON temp_accounts USING btree (
  account_id,
  created_by_block_height DESC,
  deleted_by_block_height DESC
);

CREATE INDEX t_ara_action_kind_idx ON temp_action_receipt_actions USING btree (action_kind);

CREATE INDEX t_ara_args_method_name_idx ON temp_action_receipt_actions USING btree ((args ->> 'method_name'::TEXT))
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind);

CREATE INDEX t_ara_args_function_call_receipt_receiver_account_id_idx ON temp_action_receipt_actions USING btree (
  (args ->> 'method_name'::TEXT),
  receipt_receiver_account_id
)
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind);

CREATE INDEX t_ara_args_method_name_receipt_receiver_account_id_idx ON temp_action_receipt_actions USING btree (
  (args ->> 'method_name'::TEXT),
  receipt_receiver_account_id
);

CREATE INDEX t_ara_args_receiver_id_idx ON temp_action_receipt_actions USING btree (
  (
    (args -> 'args_json'::TEXT) ->> 'receiver_id'::TEXT
  )
)
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind)
  AND (args ->> 'args_json'::TEXT) IS NOT NULL;

CREATE INDEX t_ara_receipt_included_in_block_timestamp_action_receipt_idx ON temp_action_receipt_actions USING btree (
  receipt_included_in_block_timestamp DESC,
  index_in_action_receipt DESC
);

CREATE INDEX t_ara_receipt_id_idx ON temp_action_receipt_actions USING btree (receipt_id);

CREATE INDEX t_ara_receipt_included_in_block_timestamp_idx ON temp_action_receipt_actions USING btree (receipt_included_in_block_timestamp DESC);

CREATE INDEX t_ara_receipt_predecessor_account_id_idx ON temp_action_receipt_actions USING btree (receipt_predecessor_account_id);

CREATE INDEX t_ara_receipt_receiver_account_id_idx ON temp_action_receipt_actions USING btree (receipt_receiver_account_id);

CREATE INDEX t_ara_receiver_account_id_receipt_included_in_block_timestamp_idx ON temp_action_receipt_actions USING btree (
  receipt_receiver_account_id,
  receipt_included_in_block_timestamp DESC
);

CREATE INDEX t_arod_output_data_id_idx ON temp_action_receipt_output_data USING btree (output_data_id);

CREATE INDEX t_arod_output_from_receipt_id_idx ON temp_action_receipt_output_data USING btree (output_from_receipt_id);

CREATE INDEX t_arod_receiver_account_id_idx ON temp_action_receipt_output_data USING btree (receiver_account_id);

CREATE INDEX t_b_height_idx ON temp_blocks USING btree (block_height DESC);

CREATE INDEX t_b_timestamp_idx ON temp_blocks USING btree (block_timestamp DESC);

CREATE INDEX t_c_included_in_block_hash_idx ON temp_chunks USING btree (included_in_block_hash);

CREATE INDEX t_eo_executed_in_block_timestamp_idx ON temp_execution_outcomes USING btree (executed_in_block_timestamp DESC);

CREATE INDEX t_eo_block_hash_idx ON temp_execution_outcomes USING btree (executed_in_block_hash);

CREATE INDEX t_eo_receipt_id_status_idx ON temp_execution_outcomes USING btree (receipt_id, status);

CREATE INDEX t_eo_status_idx ON temp_execution_outcomes USING btree (status);

CREATE INDEX t_eor_produced_receipt_id ON temp_execution_outcome_receipts USING btree (produced_receipt_id);

CREATE INDEX t_r_included_in_block_hash_idx ON temp_receipts USING btree (included_in_block_hash);

CREATE INDEX t_r_included_in_chunk_hash_idx ON temp_receipts USING btree (included_in_chunk_hash);

CREATE INDEX t_r_originated_from_transaction_hash_idx ON temp_receipts USING btree (originated_from_transaction_hash);

CREATE INDEX t_r_predecessor_account_id_idx ON temp_receipts USING btree (predecessor_account_id);

CREATE INDEX t_r_receiver_account_id_idx ON temp_receipts USING btree (receiver_account_id);

CREATE INDEX t_r_included_in_block_timestamp_idx ON temp_receipts USING btree (included_in_block_timestamp DESC);

CREATE INDEX t_t_converted_into_receipt_id_dx ON temp_transactions USING btree (converted_into_receipt_id);

CREATE INDEX t_t_included_in_block_hash_idx ON temp_transactions USING btree (included_in_block_hash);

CREATE INDEX t_t_block_timestamp_idx ON temp_transactions USING btree (block_timestamp DESC);

CREATE INDEX t_t_included_in_chunk_hash_idx ON temp_transactions USING btree (included_in_chunk_hash);

CREATE INDEX t_t_receiver_account_id_idx ON temp_transactions USING btree (receiver_account_id);

CREATE INDEX t_t_signer_account_id_idx ON temp_transactions USING btree (signer_account_id);

CREATE INDEX t_t_block_timestamp_index_in_chunk_idx ON temp_transactions USING btree (block_timestamp DESC, index_in_chunk DESC);

CREATE TABLE temp_balance_events (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  transaction_hash TEXT,
  receipt_id TEXT,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  direction balance_event_direction,
  cause balance_event_cause,
  status event_status,
  delta_staked_amount NUMERIC(40),
  delta_nonstaked_amount NUMERIC(40),
  absolute_staked_amount NUMERIC(40) NOT NULL,
  absolute_nonstaked_amount NUMERIC(40) NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE TABLE temp_ft_events (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount NUMERIC(40) NOT NULL,
  absolute_amount NUMERIC(40),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE TABLE temp_nft_events (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  affected_account_id TEXT,
  involved_account_id TEXT,
  authorized_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount SMALLINT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index)
);

CREATE INDEX t_be_affected_account_id_idx ON temp_balance_events USING btree (affected_account_id);

CREATE INDEX t_fte_contract_account_id_idx ON temp_ft_events USING btree (contract_account_id);

CREATE INDEX t_fte_affected_account_id_idx ON temp_ft_events USING btree (affected_account_id);

CREATE INDEX t_fte_involved_account_id_idx ON temp_ft_events USING btree (involved_account_id);

CREATE INDEX t_fte_cause_idx ON temp_ft_events USING btree (cause);

CREATE INDEX t_nfte_contract_account_id_idx ON temp_nft_events USING btree (contract_account_id);

CREATE INDEX t_nfte_affected_account_id_idx ON temp_nft_events USING btree (affected_account_id);

CREATE INDEX t_nfte_involved_account_id_idx ON temp_nft_events USING btree (involved_account_id);

CREATE INDEX t_nfte_cause_idx ON temp_nft_events USING btree (cause);

CREATE TABLE balance_events_hyper (
  event_index NUMERIC(38, 0) NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  transaction_hash TEXT,
  receipt_id TEXT,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  direction balance_event_direction,
  cause balance_event_cause,
  status event_status,
  delta_staked_amount NUMERIC(40),
  delta_nonstaked_amount NUMERIC(40),
  absolute_staked_amount NUMERIC(40) NOT NULL,
  absolute_nonstaked_amount NUMERIC(40) NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index, block_timestamp)
);

CREATE TABLE ft_events_hyper (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  affected_account_id TEXT NOT NULL,
  involved_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount NUMERIC(40) NOT NULL,
  absolute_amount NUMERIC(40),
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index, block_timestamp)
);

CREATE TABLE nft_events_hyper (
  event_index NUMERIC(38, 0) NOT NULL,
  standard TEXT NOT NULL,
  block_height NUMERIC(20, 0) NOT NULL,
  receipt_id TEXT NOT NULL,
  contract_account_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  affected_account_id TEXT,
  involved_account_id TEXT,
  authorized_account_id TEXT,
  cause event_cause,
  status event_status,
  event_memo TEXT,
  delta_amount SMALLINT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (event_index, block_timestamp)
);

CREATE INDEX beh_affected_account_id_idx ON balance_events_hyper USING btree (affected_account_id);

CREATE INDEX fteh_contract_account_id_idx ON ft_events_hyper USING btree (contract_account_id);

CREATE INDEX fteh_affected_account_id_idx ON ft_events_hyper USING btree (affected_account_id);

CREATE INDEX nfteh_contract_account_id_idx ON nft_events_hyper USING btree (contract_account_id);

CREATE INDEX nfteh_affected_account_id_idx ON nft_events_hyper USING btree (affected_account_id);

SELECT
  create_hypertable (
    'balance_events_hyper',
    'block_timestamp',
    chunk_time_interval => 604800000000000
  );

SELECT
  create_hypertable (
    'ft_events_hyper',
    'block_timestamp',
    chunk_time_interval => 604800000000000
  );

SELECT
  create_hypertable (
    'nft_events_hyper',
    'block_timestamp',
    chunk_time_interval => 3628800000000000
  );

SELECT
  set_integer_now_func ('balance_events_hyper', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('ft_events_hyper', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('nft_events_hyper', 'epoch_nano_seconds');

DROP MATERIALIZED VIEW balance_events_daily;

DROP MATERIALIZED VIEW ft_events_daily;

DROP MATERIALIZED VIEW ft_holders_monthly;

DROP MATERIALIZED VIEW ft_holders_daily;

DROP MATERIALIZED VIEW ft_holders_hourly;

DROP MATERIALIZED VIEW ft_contracts_daily;

DROP MATERIALIZED VIEW nft_holders_daily;

DROP MATERIALIZED VIEW nft_holders_hourly;

DROP MATERIALIZED VIEW nft_contracts_daily;

CREATE MATERIALIZED VIEW balance_events_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  affected_account_id AS account,
  last (absolute_staked_amount, block_timestamp) AS staked_amount,
  last (absolute_nonstaked_amount, block_timestamp) AS nonstaked_amount
FROM
  balance_events_hyper
GROUP BY
  account,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'balance_events_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_events_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract,
  affected_account_id as account,
  last (absolute_amount, block_timestamp) AS amount
FROM
  ft_events_hyper
GROUP BY
  contract,
  account,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_events_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_holders_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '3600000000000', block_timestamp) AS time_hourly,
  contract_account_id AS contract,
  affected_account_id AS account,
  SUM(delta_amount) AS amount,
  STATS_AGG (delta_amount) AS amount_hourly
FROM
  ft_events_hyper
GROUP BY
  contract,
  account,
  time_hourly
HAVING
  SUM(delta_amount) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_hourly',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000',
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW ft_holders_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', time_hourly) AS time_daily,
  contract,
  account,
  SUM(rollup (amount_hourly)) AS amount,
  rollup (amount_hourly) AS amount_daily
FROM
  ft_holders_hourly
GROUP BY
  contract,
  account,
  time_daily
HAVING
  SUM(rollup (amount_hourly)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW ft_holders_monthly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '2592000000000000', time_daily) AS time_monthly,
  contract,
  account,
  SUM(rollup (amount_daily)) AS amount,
  rollup (amount_daily) AS amount_monthly
FROM
  ft_holders_daily
GROUP BY
  contract,
  account,
  time_monthly
HAVING
  SUM(rollup (amount_daily)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_holders_monthly',
    start_offset => NULL,
    end_offset => BIGINT '2592000000000000',
    schedule_interval => INTERVAL '30 day'
  );

CREATE MATERIALIZED VIEW ft_contracts_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract
FROM
  ft_events_hyper
GROUP BY
  contract,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'ft_contracts_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW nft_holders_hourly
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '3600000000000', block_timestamp) AS time_hourly,
  contract_account_id AS contract,
  token_id AS token,
  affected_account_id AS account,
  SUM(delta_amount) AS quantity,
  STATS_AGG (delta_amount) AS quantity_hourly
FROM
  nft_events_hyper
GROUP BY
  contract,
  token,
  account,
  time_hourly
HAVING
  SUM(delta_amount) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_holders_hourly',
    start_offset => NULL,
    end_offset => BIGINT '3600000000000',
    schedule_interval => INTERVAL '1 hour'
  );

CREATE MATERIALIZED VIEW nft_holders_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', time_hourly) AS time_daily,
  contract,
  token,
  account,
  SUM(rollup (quantity_hourly)) AS quantity,
  rollup (quantity_hourly) AS quantity_daily
FROM
  nft_holders_hourly
GROUP BY
  contract,
  token,
  account,
  time_daily
HAVING
  SUM(rollup (quantity_hourly)) > 0
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_holders_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE MATERIALIZED VIEW nft_contracts_daily
WITH
  (timescaledb.continuous) AS
SELECT
  time_bucket (BIGINT '86400000000000', block_timestamp) AS time_daily,
  contract_account_id AS contract,
  token_id AS token
FROM
  nft_events_hyper
GROUP BY
  contract,
  token,
  time_daily
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_contracts_daily',
    start_offset => NULL,
    end_offset => BIGINT '86400000000000',
    schedule_interval => INTERVAL '1 day'
  );

CREATE
OR REPLACE FUNCTION sync_balance_events_insert () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO balance_events_hyper SELECT NEW.*;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_ft_events_insert () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ft_events_hyper SELECT NEW.*;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_nft_events_insert () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO nft_events_hyper SELECT NEW.*;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_balance_events_update () RETURNS TRIGGER AS $$
BEGIN
    UPDATE balance_events_hyper
    SET
      block_height = NEW.block_height,
      transaction_hash = NEW.transaction_hash,
      receipt_id = NEW.receipt_id,
      affected_account_id = NEW.affected_account_id,
      involved_account_id = NEW.involved_account_id,
      direction = NEW.direction,
      cause = NEW.cause,
      status = NEW.status,
      delta_staked_amount = NEW.delta_staked_amount,
      delta_nonstaked_amount = NEW.delta_nonstaked_amount,
      absolute_staked_amount = NEW.absolute_staked_amount,
      absolute_nonstaked_amount = NEW.absolute_nonstaked_amount,
      block_timestamp = NEW.block_timestamp
    WHERE
      event_index = NEW.event_index;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_ft_events_update () RETURNS TRIGGER AS $$
BEGIN
    UPDATE ft_events_hyper
    SET
      standard = NEW.standard,
      block_height = NEW.block_height,
      receipt_id = NEW.receipt_id,
      contract_account_id = NEW.contract_account_id,
      affected_account_id = NEW.affected_account_id,
      involved_account_id = NEW.involved_account_id,
      cause = NEW.cause,
      status = NEW.status,
      event_memo = NEW.event_memo,
      delta_amount = NEW.delta_amount,
      absolute_amount = NEW.absolute_amount,
      block_timestamp = NEW.block_timestamp
    WHERE
      event_index = NEW.event_index;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_nft_events_update () RETURNS TRIGGER AS $$
BEGIN
    UPDATE nft_events_hyper
    SET
      standard = NEW.standard,
      block_height = NEW.block_height,
      receipt_id = NEW.receipt_id,
      contract_account_id = NEW.contract_account_id,
      token_id = NEW.token_id,
      affected_account_id = NEW.affected_account_id,
      involved_account_id = NEW.involved_account_id,
      authorized_account_id = NEW.authorized_account_id,
      cause = NEW.cause,
      status = NEW.status,
      event_memo = NEW.event_memo,
      delta_amount = NEW.delta_amount,
      block_timestamp = NEW.block_timestamp
    WHERE
      event_index = NEW.event_index;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_balance_events_delete () RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM balance_events_hyper WHERE event_index = OLD.event_index;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_ft_events_delete () RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM ft_events_hyper WHERE event_index = OLD.event_index;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION sync_nft_events_delete () RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM nft_events_hyper WHERE event_index = OLD.event_index;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER balance_events_insert_trigger
AFTER INSERT ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_insert ();

CREATE TRIGGER ft_events_insert_trigger
AFTER INSERT ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_insert ();

CREATE TRIGGER nft_events_insert_trigger
AFTER INSERT ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_insert ();

CREATE TRIGGER balance_events_update_trigger
AFTER
UPDATE ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_update ();

CREATE TRIGGER ft_events_update_trigger
AFTER
UPDATE ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_update ();

CREATE TRIGGER nft_events_update_trigger
AFTER
UPDATE ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_update ();

CREATE TRIGGER balance_events_delete_trigger
AFTER DELETE ON balance_events FOR EACH ROW
EXECUTE FUNCTION sync_balance_events_delete ();

CREATE TRIGGER ft_events_delete_trigger
AFTER DELETE ON ft_events FOR EACH ROW
EXECUTE FUNCTION sync_ft_events_delete ();

CREATE TRIGGER nft_events_delete_trigger
AFTER DELETE ON nft_events FOR EACH ROW
EXECUTE FUNCTION sync_nft_events_delete ();
