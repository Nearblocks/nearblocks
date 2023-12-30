CREATE TYPE access_key_permission_kind AS ENUM('FULL_ACCESS', 'FUNCTION_CALL');

CREATE TYPE action_kind AS ENUM(
  'CREATE_ACCOUNT',
  'DEPLOY_CONTRACT',
  'FUNCTION_CALL',
  'TRANSFER',
  'STAKE',
  'ADD_KEY',
  'DELETE_KEY',
  'DELETE_ACCOUNT',
  'UNKNOWN'
);

CREATE TYPE execution_outcome_status AS ENUM(
  'UNKNOWN',
  'FAILURE',
  'SUCCESS_VALUE',
  'SUCCESS_RECEIPT_ID'
);

CREATE TYPE receipt_kind AS ENUM('ACTION', 'DATA');

CREATE TYPE state_change_reason_kind AS ENUM(
  'TRANSACTION_PROCESSING',
  'ACTION_RECEIPT_PROCESSING_STARTED',
  'ACTION_RECEIPT_GAS_REWARD',
  'RECEIPT_PROCESSING',
  'POSTPONED_RECEIPT',
  'UPDATED_DELAYED_RECEIPTS',
  'VALIDATOR_ACCOUNTS_UPDATE',
  'MIGRATION',
  'RESHARDING'
);

CREATE TYPE app__stripe_status AS ENUM(
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid'
);

CREATE TYPE app__verifications_type AS ENUM('VERIFY_EMAIL', 'RESET_PASSWORD', 'UPDATE_EMAIL');

CREATE FUNCTION count_cost_estimate (query text) RETURNS TABLE (rows NUMERIC, cost NUMERIC) AS $$
  DECLARE
    rec JSON;
  BEGIN
    EXECUTE 'EXPLAIN (FORMAT JSON) ' || query INTO rec;
    rows := CAST(rec -> 0 -> 'Plan' ->> 'Plan Rows' AS NUMERIC);
    cost := CAST(rec -> 0 -> 'Plan' ->> 'Total Cost' AS NUMERIC);
    RETURN NEXT;
  END;
$$ LANGUAGE PLPGSQL STRICT;

CREATE FUNCTION count_estimate (query TEXT) RETURNS NUMERIC AS $$
  DECLARE
    rec RECORD;
    rows NUMERIC;
  BEGIN
    FOR rec IN EXECUTE 'EXPLAIN ' || query LOOP
      rows := SUBSTRING(rec. "QUERY PLAN" FROM ' rows=([[:digit:]]+)');
      EXIT WHEN rows IS NOT NULL;
    END LOOP;
    RETURN rows;
  END;
$$ LANGUAGE PLPGSQL STRICT;

CREATE FUNCTION epoch_nano_seconds () RETURNS BIGINT AS $$
  SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT * 1000 * 1000 * 1000;
$$ LANGUAGE SQL STABLE;

CREATE TABLE access_keys (
  public_key TEXT NOT NULL,
  account_id TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  created_by_block_height NUMERIC(20, 0) NOT NULL,
  deleted_by_block_height NUMERIC(20, 0),
  permission_kind access_key_permission_kind,
  created_by_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (
    public_key,
    account_id,
    created_by_block_timestamp
  )
);

CREATE TABLE accounts (
  account_id TEXT NOT NULL,
  created_by_receipt_id TEXT,
  deleted_by_receipt_id TEXT,
  created_by_block_height NUMERIC(20, 0) NOT NULL,
  deleted_by_block_height NUMERIC(20, 0),
  created_by_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (account_id, created_by_block_timestamp)
);

CREATE TABLE action_receipt_actions (
  receipt_id TEXT NOT NULL,
  index_in_action_receipt INTEGER NOT NULL,
  receipt_predecessor_account_id TEXT NOT NULL,
  receipt_receiver_account_id TEXT NOT NULL,
  action_kind action_kind NOT NULL,
  args JSONB NOT NULL,
  receipt_included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (
    receipt_id,
    index_in_action_receipt,
    receipt_included_in_block_timestamp
  )
);

CREATE TABLE action_receipt_output_data (
  output_data_id TEXT NOT NULL,
  output_from_receipt_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (
    output_data_id,
    output_from_receipt_id,
    receipt_included_in_block_timestamp
  )
);

CREATE TABLE blocks (
  block_height NUMERIC(20, 0) NOT NULL,
  block_hash TEXT NOT NULL,
  prev_block_hash TEXT NOT NULL,
  total_supply NUMERIC(45, 0) NOT NULL,
  gas_price NUMERIC(45, 0) NOT NULL,
  author_account_id TEXT NOT NULL,
  block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (block_hash, block_timestamp)
);

CREATE TABLE chunks (
  included_in_block_hash TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,
  shard_id NUMERIC(20, 0) NOT NULL,
  gas_limit NUMERIC(20, 0) NOT NULL,
  gas_used NUMERIC(20, 0) NOT NULL,
  author_account_id TEXT NOT NULL,
  included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (chunk_hash, included_in_block_timestamp)
);

CREATE TABLE execution_outcomes (
  receipt_id TEXT NOT NULL,
  executed_in_block_hash TEXT NOT NULL,
  shard_id NUMERIC(20, 0) NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  gas_burnt NUMERIC(20, 0) NOT NULL,
  tokens_burnt NUMERIC(45, 0) NOT NULL,
  executor_account_id TEXT NOT NULL,
  status execution_outcome_status NOT NULL,
  executed_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (receipt_id, executed_in_block_timestamp)
);

CREATE TABLE execution_outcome_receipts (
  executed_receipt_id TEXT NOT NULL,
  index_in_execution_outcome INTEGER NOT NULL,
  produced_receipt_id TEXT NOT NULL,
  executed_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (
    executed_receipt_id,
    index_in_execution_outcome,
    produced_receipt_id,
    executed_in_block_timestamp
  )
);

CREATE TABLE receipts (
  receipt_id TEXT NOT NULL,
  included_in_block_hash TEXT NOT NULL,
  included_in_chunk_hash TEXT NOT NULL,
  index_in_chunk INTEGER NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_kind receipt_kind NOT NULL,
  originated_from_transaction_hash TEXT NOT NULL,
  included_in_block_timestamp BIGINT NOT NULL,
  PRIMARY KEY (receipt_id, included_in_block_timestamp)
);

CREATE TABLE transactions (
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
  PRIMARY KEY (transaction_hash, block_timestamp)
);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);

CREATE TABLE api__users (
  id BIGSERIAL NOT NULL,
  stripe_cid TEXT,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  last_login_at TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (stripe_cid),
  UNIQUE (email),
  UNIQUE (username)
);

CREATE TABLE api__verifications (
  id BIGSERIAL NOT NULL,
  user_id BIGINT NOT NULL,
  type app__verifications_type NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (user_id, type),
  UNIQUE (code)
);

CREATE TABLE api__plans (
  id SERIAL NOT NULL,
  stripe_pid TEXT,
  stripe_mpid TEXT,
  stripe_ypid TEXT,
  title TEXT NOT NULL,
  limit_per_second INTEGER,
  limit_per_minute INTEGER,
  limit_per_day INTEGER,
  limit_per_month INTEGER,
  price_monthly INTEGER,
  price_annually INTEGER,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (stripe_pid),
  UNIQUE (stripe_mpid),
  UNIQUE (stripe_ypid)
);

CREATE TABLE api__subscriptions (
  id BIGSERIAL NOT NULL,
  stripe_sid TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  plan_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status app__stripe_status NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (stripe_sid)
);

CREATE TABLE api__keys (
  id BIGSERIAL NOT NULL,
  user_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (token)
);

CREATE INDEX ak_account_id_deleted_by_receipt_created_by_block_timestamp_idx ON access_keys USING btree (account_id, created_by_block_timestamp DESC);

CREATE INDEX ak_account_id_idx ON access_keys USING btree (account_id);

CREATE INDEX ak_public_key_idx ON access_keys USING btree (public_key);

CREATE INDEX ak_account_id_created_by_block_height_block_timestamp_idx ON access_keys USING btree (
  account_id,
  created_by_block_height DESC,
  deleted_by_block_height DESC
);

CREATE INDEX a_created_by_block_timestamp_idx ON accounts USING btree (created_by_block_timestamp DESC);

CREATE INDEX a_account_id_created_by_block_height_block_timestamp_idx ON accounts USING btree (
  account_id,
  created_by_block_height DESC,
  deleted_by_block_height DESC
);

CREATE INDEX ara_action_kind_idx ON action_receipt_actions USING btree (action_kind);

CREATE INDEX ara_args_method_name_idx ON action_receipt_actions USING btree ((args ->> 'method_name'::text))
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind);

CREATE INDEX ara_args_function_call_receipt_receiver_account_id_idx ON action_receipt_actions USING btree (
  (args ->> 'method_name'::text),
  receipt_receiver_account_id
)
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind);

CREATE INDEX ara_args_method_name_receipt_receiver_account_id_idx ON action_receipt_actions USING btree (
  (args ->> 'method_name'::text),
  receipt_receiver_account_id
);

CREATE INDEX ara_args_receiver_id_idx ON action_receipt_actions USING btree (
  (
    (args -> 'args_json'::text) ->> 'receiver_id'::text
  )
)
WHERE
  (action_kind = 'FUNCTION_CALL'::action_kind)
  AND (args ->> 'args_json'::text) IS NOT NULL;

CREATE INDEX ara_receipt_included_in_block_timestamp_action_receipt_idx ON action_receipt_actions USING btree (
  receipt_included_in_block_timestamp DESC,
  index_in_action_receipt DESC
);

CREATE INDEX ara_receipt_id_idx ON action_receipt_actions USING btree (receipt_id);

CREATE INDEX ara_receipt_included_in_block_timestamp_idx ON action_receipt_actions USING btree (receipt_included_in_block_timestamp DESC);

CREATE INDEX ara_receipt_predecessor_account_id_idx ON action_receipt_actions USING btree (receipt_predecessor_account_id);

CREATE INDEX ara_receipt_receiver_account_id_idx ON action_receipt_actions USING btree (receipt_receiver_account_id);

CREATE INDEX ara_receiver_account_id_receipt_included_in_block_timestamp_idx ON action_receipt_actions USING btree (
  receipt_receiver_account_id,
  receipt_included_in_block_timestamp DESC
);

CREATE INDEX arod_output_data_id_idx ON action_receipt_output_data USING btree (output_data_id);

CREATE INDEX arod_output_from_receipt_id_idx ON action_receipt_output_data USING btree (output_from_receipt_id);

CREATE INDEX arod_receiver_account_id_idx ON action_receipt_output_data USING btree (receiver_account_id);

CREATE INDEX b_height_idx ON blocks USING btree (block_height DESC);

CREATE INDEX b_timestamp_idx ON blocks USING btree (block_timestamp DESC);

CREATE INDEX c_included_in_block_hash_idx ON chunks USING btree (included_in_block_hash);

CREATE INDEX eo_executed_in_block_timestamp_idx ON execution_outcomes USING btree (executed_in_block_timestamp DESC);

CREATE INDEX eo_block_hash_idx ON execution_outcomes USING btree (executed_in_block_hash);

CREATE INDEX eo_receipt_id_status_idx ON execution_outcomes USING btree (receipt_id, status);

CREATE INDEX eo_status_idx ON execution_outcomes USING btree (status);

CREATE INDEX eor_produced_receipt_id ON execution_outcome_receipts USING btree (produced_receipt_id);

CREATE INDEX r_included_in_block_hash_idx ON receipts USING btree (included_in_block_hash);

CREATE INDEX r_included_in_chunk_hash_idx ON receipts USING btree (included_in_chunk_hash);

CREATE INDEX r_originated_from_transaction_hash_idx ON receipts USING btree (originated_from_transaction_hash);

CREATE INDEX r_predecessor_account_id_idx ON receipts USING btree (predecessor_account_id);

CREATE INDEX r_receiver_account_id_idx ON receipts USING btree (receiver_account_id);

CREATE INDEX r_included_in_block_timestamp_idx ON receipts USING btree (included_in_block_timestamp DESC);

CREATE INDEX t_converted_into_receipt_id_dx ON transactions USING btree (converted_into_receipt_id);

CREATE INDEX t_included_in_block_hash_idx ON transactions USING btree (included_in_block_hash);

CREATE INDEX t_block_timestamp_idx ON transactions USING btree (block_timestamp DESC);

CREATE INDEX t_included_in_chunk_hash_idx ON transactions USING btree (included_in_chunk_hash);

CREATE INDEX t_receiver_account_id_idx ON transactions USING btree (receiver_account_id);

CREATE INDEX t_signer_account_id_idx ON transactions USING btree (signer_account_id);

CREATE INDEX t_block_timestamp_index_in_chunk_idx ON transactions USING btree (block_timestamp DESC, index_in_chunk DESC);

SELECT
  create_hypertable (
    'access_keys',
    'created_by_block_timestamp',
    chunk_time_interval => 3024000000000000
  );

SELECT
  create_hypertable (
    'accounts',
    'created_by_block_timestamp',
    chunk_time_interval => 3628800000000000
  );

SELECT
  create_hypertable (
    'action_receipt_actions',
    'receipt_included_in_block_timestamp',
    chunk_time_interval => 259200000000000
  );

SELECT
  create_hypertable (
    'blocks',
    'block_timestamp',
    chunk_time_interval => 3628800000000000
  );

SELECT
  create_hypertable (
    'chunks',
    'included_in_block_timestamp',
    chunk_time_interval => 1209600000000000
  );

SELECT
  create_hypertable (
    'execution_outcomes',
    'executed_in_block_timestamp',
    chunk_time_interval => 604800000000000
  );

SELECT
  create_hypertable (
    'receipts',
    'included_in_block_timestamp',
    chunk_time_interval => 432000000000000
  );

SELECT
  create_hypertable (
    'transactions',
    'block_timestamp',
    chunk_time_interval => 604800000000000
  );

SELECT
  set_integer_now_func ('access_keys', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('accounts', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('action_receipt_actions', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('blocks', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('chunks', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('execution_outcomes', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('receipts', 'epoch_nano_seconds');

SELECT
  set_integer_now_func ('transactions', 'epoch_nano_seconds');
