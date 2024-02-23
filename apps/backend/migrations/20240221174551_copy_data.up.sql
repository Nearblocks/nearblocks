INSERT INTO
  temp_access_keys (
    public_key,
    account_id,
    created_by_receipt_id,
    deleted_by_receipt_id,
    created_by_block_height,
    deleted_by_block_height,
    permission_kind
  )
SELECT
  public_key,
  account_id,
  first (created_by_receipt_id, created_by_block_timestamp) AS created_by_receipt_id,
  first (deleted_by_receipt_id, created_by_block_timestamp) AS deleted_by_receipt_id,
  first (
    created_by_block_height,
    created_by_block_timestamp
  ) AS created_by_block_height,
  first (
    deleted_by_block_height,
    created_by_block_timestamp
  ) AS deleted_by_block_height,
  first (permission_kind, created_by_block_timestamp) AS permission_kind
FROM
  access_keys
GROUP BY
  public_key,
  account_id;

INSERT INTO
  temp_accounts (
    account_id,
    created_by_receipt_id,
    deleted_by_receipt_id,
    created_by_block_height,
    deleted_by_block_height
  )
SELECT
  account_id,
  first (created_by_receipt_id, created_by_block_timestamp) AS created_by_receipt_id,
  NULL AS deleted_by_receipt_id,
  first (
    created_by_block_height,
    created_by_block_timestamp
  ) AS created_by_block_height,
  NULL AS deleted_by_block_height
FROM
  accounts
GROUP BY
  account_id;

INSERT INTO
  temp_action_receipt_actions (
    receipt_id,
    index_in_action_receipt,
    receipt_predecessor_account_id,
    receipt_receiver_account_id,
    action_kind,
    args,
    receipt_included_in_block_timestamp
  )
SELECT
  receipt_id,
  index_in_action_receipt,
  receipt_predecessor_account_id,
  receipt_receiver_account_id,
  action_kind action_kind,
  args,
  receipt_included_in_block_timestamp
FROM
  action_receipt_actions;

INSERT INTO
  temp_action_receipt_output_data (
    output_data_id,
    output_from_receipt_id,
    receiver_account_id,
    receipt_included_in_block_timestamp
  )
SELECT
  output_data_id,
  output_from_receipt_id,
  receiver_account_id,
  receipt_included_in_block_timestamp
FROM
  action_receipt_output_data;

INSERT INTO
  temp_blocks (
    block_height,
    block_hash,
    prev_block_hash,
    total_supply,
    gas_price,
    author_account_id,
    block_timestamp
  )
SELECT
  block_height,
  block_hash,
  prev_block_hash,
  total_supply,
  gas_price,
  author_account_id,
  block_timestamp
FROM
  blocks;

INSERT INTO
  temp_chunks (
    included_in_block_hash,
    chunk_hash,
    shard_id,
    gas_limit,
    gas_used,
    author_account_id,
    included_in_block_timestamp
  )
SELECT
  included_in_block_hash,
  chunk_hash,
  shard_id,
  gas_limit,
  gas_used,
  author_account_id,
  included_in_block_timestamp
FROM
  chunks;

INSERT INTO
  temp_execution_outcomes (
    receipt_id,
    executed_in_block_hash,
    shard_id,
    index_in_chunk,
    gas_burnt,
    tokens_burnt,
    executor_account_id,
    status,
    executed_in_block_timestamp
  )
SELECT
  receipt_id,
  executed_in_block_hash,
  shard_id,
  index_in_chunk,
  gas_burnt,
  tokens_burnt,
  executor_account_id,
  status,
  executed_in_block_timestamp
FROM
  execution_outcomes;

INSERT INTO
  temp_execution_outcome_receipts (
    executed_receipt_id,
    index_in_execution_outcome,
    produced_receipt_id,
    executed_in_block_timestamp
  )
SELECT
  executed_receipt_id,
  index_in_execution_outcome,
  produced_receipt_id,
  executed_in_block_timestamp
FROM
  execution_outcome_receipts;

INSERT INTO
  temp_receipts (
    receipt_id,
    included_in_block_hash,
    included_in_chunk_hash,
    index_in_chunk,
    predecessor_account_id,
    receiver_account_id,
    receipt_kind,
    originated_from_transaction_hash,
    included_in_block_timestamp
  )
SELECT
  receipt_id,
  included_in_block_hash,
  included_in_chunk_hash,
  index_in_chunk,
  predecessor_account_id,
  receiver_account_id,
  receipt_kind,
  originated_from_transaction_hash,
  included_in_block_timestamp
FROM
  receipts;

INSERT INTO
  temp_transactions (
    transaction_hash,
    included_in_block_hash,
    included_in_chunk_hash,
    index_in_chunk,
    signer_account_id,
    receiver_account_id,
    status,
    converted_into_receipt_id,
    receipt_conversion_gas_burnt,
    receipt_conversion_tokens_burnt,
    block_timestamp
  )
SELECT
  transaction_hash,
  included_in_block_hash,
  included_in_chunk_hash,
  index_in_chunk,
  signer_account_id,
  receiver_account_id,
  status,
  converted_into_receipt_id,
  receipt_conversion_gas_burnt,
  receipt_conversion_tokens_burnt,
  block_timestamp
FROM
  transactions;

INSERT INTO
  temp_balance_events (
    event_index,
    block_height,
    transaction_hash,
    receipt_id,
    affected_account_id,
    involved_account_id,
    direction,
    cause,
    status,
    delta_staked_amount,
    delta_nonstaked_amount,
    absolute_staked_amount,
    absolute_nonstaked_amount,
    block_timestamp
  )
SELECT
  event_index,
  block_height,
  transaction_hash,
  receipt_id,
  affected_account_id,
  involved_account_id,
  direction,
  cause,
  status,
  delta_staked_amount,
  delta_nonstaked_amount,
  absolute_staked_amount,
  absolute_nonstaked_amount,
  block_timestamp
FROM
  balance_events;

INSERT INTO
  temp_ft_events (
    event_index,
    standard,
    block_height,
    receipt_id,
    contract_account_id,
    affected_account_id,
    involved_account_id,
    cause,
    status,
    event_memo,
    delta_amount,
    absolute_amount,
    block_timestamp
  )
SELECT
  event_index,
  standard,
  block_height,
  receipt_id,
  contract_account_id,
  affected_account_id,
  involved_account_id,
  cause,
  status,
  event_memo,
  delta_amount,
  absolute_amount,
  block_timestamp
FROM
  ft_events;

INSERT INTO
  temp_nft_events (
    event_index,
    standard,
    block_height,
    receipt_id,
    contract_account_id,
    token_id,
    affected_account_id,
    involved_account_id,
    authorized_account_id,
    cause,
    status,
    event_memo,
    delta_amount,
    block_timestamp
  )
SELECT
  event_index,
  standard,
  block_height,
  receipt_id,
  contract_account_id,
  token_id,
  affected_account_id,
  involved_account_id,
  authorized_account_id,
  cause,
  status,
  event_memo,
  delta_amount,
  block_timestamp
FROM
  nft_events;
