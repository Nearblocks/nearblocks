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
  'DELEGATE_ACTION',
  'UNKNOWN'
);

CREATE TYPE execution_outcome_status AS ENUM(
  'UNKNOWN',
  'FAILURE',
  'SUCCESS_VALUE',
  'SUCCESS_RECEIPT_ID'
);

CREATE TYPE receipt_kind AS ENUM('ACTION', 'DATA');

CREATE TABLE accounts (
  created_by_block_height INTEGER NOT NULL,
  deleted_by_block_height INTEGER,
  account_id text NOT NULL,
  created_by_receipt_id text,
  deleted_by_receipt_id text,
  PRIMARY KEY (account_id, created_by_block_height)
)
PARTITION BY
  HASH (account_id);

DO $$
DECLARE
    modulus INTEGER := 128;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE accounts_p%s PARTITION OF accounts FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE access_keys (
  created_by_block_height INTEGER NOT NULL,
  deleted_by_block_height INTEGER,
  public_key text NOT NULL,
  account_id text NOT NULL,
  created_by_receipt_id text,
  deleted_by_receipt_id text,
  permission_kind access_key_permission_kind,
  PRIMARY KEY (public_key, account_id)
)
PARTITION BY
  HASH (account_id);

DO $$
DECLARE
    modulus INTEGER := 128;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE access_keys_p%s PARTITION OF access_keys FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE blocks (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  prev_block_hash TEXT NOT NULL,
  author_account_id TEXT NOT NULL,
  total_supply NUMERIC(38, 0) NOT NULL,
  gas_price NUMERIC(20, 0) NOT NULL,
  block_bytea BYTEA NOT NULL,
  PRIMARY KEY (block_height)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.blocks',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE chunks (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  chunk_hash TEXT NOT NULL,
  author_account_id TEXT NOT NULL,
  gas_limit NUMERIC(20, 0) NOT NULL,
  gas_used NUMERIC(20, 0) NOT NULL,
  PRIMARY KEY (block_height, chunk_hash)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.chunks',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE transactions (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_block INTEGER NOT NULL,
  chunk_hash TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  signer_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  gas_burnt NUMERIC(20, 0),
  tokens_burnt NUMERIC(38, 0),
  status execution_outcome_status NOT NULL,
  PRIMARY KEY (block_height, transaction_hash)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.transactions',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE receipts (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_block INTEGER NOT NULL,
  chunk_hash TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  public_key TEXT,
  receipt_kind receipt_kind NOT NULL,
  PRIMARY KEY (block_height, receipt_id)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.receipts',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE action_receipt_actions (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_action_receipt INTEGER NOT NULL,
  receipt_id TEXT NOT NULL,
  predecessor_account_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  action_kind action_kind NOT NULL,
  args JSONB NOT NULL,
  nep518_rlp_hash TEXT,
  PRIMARY KEY (block_height, receipt_id, index_in_action_receipt)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.action_receipt_actions',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE action_receipt_input_data (
  input_data_id TEXT NOT NULL,
  input_to_receipt_id TEXT NOT NULL,
  PRIMARY KEY (input_data_id, input_to_receipt_id)
);

CREATE TABLE action_receipt_output_data (
  output_data_id TEXT NOT NULL,
  output_from_receipt_id TEXT NOT NULL,
  receiver_account_id TEXT NOT NULL,
  PRIMARY KEY (output_data_id, output_from_receipt_id)
);

CREATE TABLE execution_outcomes (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_block INTEGER NOT NULL,
  shard_id SMALLINT NOT NULL,
  receipt_id TEXT NOT NULL,
  executor_account_id TEXT NOT NULL,
  gas_burnt NUMERIC(20, 0) NOT NULL,
  tokens_burnt NUMERIC(38, 0) NOT NULL,
  status execution_outcome_status NOT NULL,
  logs BYTEA,
  PRIMARY KEY (block_height, receipt_id)
)
PARTITION BY
  RANGE (block_height);

SELECT
  partman.create_parent (
    p_parent_table := 'public.execution_outcomes',
    p_control := 'block_height',
    p_interval := '2000000',
    p_start_partition := '8000000'
  );

CREATE TABLE execution_outcome_receipts (
  executed_receipt_id TEXT NOT NULL,
  index_in_execution_outcome INTEGER NOT NULL,
  produced_receipt_id TEXT NOT NULL,
  PRIMARY KEY (
    executed_receipt_id,
    index_in_execution_outcome,
    produced_receipt_id
  )
);

CREATE TABLE settings (
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  PRIMARY KEY (key)
);

-- LOOKUP TABLES
CREATE TABLE account_transactions (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_block INTEGER NOT NULL,
  is_from BOOLEAN NOT NULL,
  transaction_hash TEXT NOT NULL,
  account_id TEXT NOT NULL,
  involved_account_id TEXT NOT NULL,
  PRIMARY KEY (account_id, transaction_hash)
)
PARTITION BY
  HASH (account_id);

DO $$
DECLARE
    modulus INTEGER := 256;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE account_transactions_p%s PARTITION OF account_transactions FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE account_receipts (
  block_timestamp BIGINT NOT NULL,
  block_height INTEGER NOT NULL,
  index_in_block INTEGER NOT NULL,
  is_from BOOLEAN NOT NULL,
  transaction_hash TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  involved_account_id TEXT NOT NULL,
  actions JSONB,
  methods JSONB,
  PRIMARY KEY (account_id, receipt_id)
)
PARTITION BY
  HASH (account_id);

DO $$
DECLARE
    modulus INTEGER := 256;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE account_receipts_p%s PARTITION OF account_receipts FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE block_transactions (
  block_height INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  PRIMARY KEY (transaction_hash)
)
PARTITION BY
  HASH (transaction_hash);

DO $$
DECLARE
    modulus INTEGER := 128;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE block_transactions_p%s PARTITION OF block_transactions FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE block_receipts (
  block_height INTEGER NOT NULL,
  receipt_id TEXT NOT NULL,
  PRIMARY KEY (receipt_id)
)
PARTITION BY
  HASH (receipt_id);

DO $$
DECLARE
    modulus INTEGER := 128;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE block_receipts_p%s PARTITION OF block_receipts FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;

CREATE TABLE transaction_receipts (
  block_height INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  receipt_id TEXT NOT NULL,
  PRIMARY KEY (transaction_hash, receipt_id)
)
PARTITION BY
  HASH (transaction_hash);

DO $$
DECLARE
    modulus INTEGER := 256;
    i INTEGER;
BEGIN
    FOR i IN 0..(modulus - 1) LOOP
        EXECUTE format(
            'CREATE TABLE transaction_receipts_p%s PARTITION OF transaction_receipts FOR VALUES WITH (MODULUS %s, REMAINDER %s);',
            i + 1, modulus, i
        );
    END LOOP;
END $$;
