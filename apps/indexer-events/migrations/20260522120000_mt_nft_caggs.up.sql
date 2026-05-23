CREATE MATERIALIZED VIEW IF NOT EXISTS mt_contract_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  contract_account_id AS contract,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers_count,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS unique_receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS unique_senders,
  COUNT(DISTINCT affected_account_id) AS unique_accounts
FROM
  mt_events
GROUP BY
  date,
  contract
ORDER BY
  date,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'mt_contract_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE MATERIALIZED VIEW IF NOT EXISTS mt_token_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  contract_account_id AS contract,
  token_id AS token,
  SUM(
    CASE
      WHEN cause = 'MINT' THEN delta_amount
      WHEN cause = 'BURN' THEN ABS(delta_amount)
      WHEN cause = 'TRANSFER'
      AND delta_amount > 0 THEN delta_amount
      ELSE 0
    END
  ) AS transfers_amount,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers_count,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS unique_receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS unique_senders,
  COUNT(DISTINCT affected_account_id) AS unique_accounts
FROM
  mt_events
GROUP BY
  date,
  contract,
  token
ORDER BY
  date,
  contract,
  token
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'mt_token_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS mts_contract_token_date_idx ON mt_token_stats (contract, token, date DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS mt_account_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  contract_account_id AS contract,
  token_id AS token,
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount < 0 THEN ABS(delta_amount)
        ELSE 0
      END
    ),
    0
  ) AS sent_amount,
  COALESCE(
    SUM(
      CASE
        WHEN delta_amount > 0 THEN delta_amount
        ELSE 0
      END
    ),
    0
  ) AS received_amount,
  COUNT(*) AS total_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
  ) AS inbound_transfers,
  COUNT(*) FILTER (
    WHERE
      delta_amount < 0
  ) AS outbound_transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_sent,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_received
FROM
  mt_events
GROUP BY
  date,
  account,
  contract,
  token
ORDER BY
  date,
  account,
  contract,
  token
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'mt_account_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS mas_account_contract_token_date_idx ON mt_account_stats (account, contract, token, date DESC);

CREATE INDEX IF NOT EXISTS mas_contract_token_date_idx ON mt_account_stats (contract, token, date DESC);

DROP MATERIALIZED VIEW IF EXISTS account_mt_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS account_mt_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  COUNT(DISTINCT contract_account_id) AS contracts,
  COUNT(*) AS transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_out,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_in
FROM
  mt_events
GROUP BY
  date,
  account
ORDER BY
  date,
  account
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_mt_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_ams_account_idx ON account_mt_stats (account);

CREATE MATERIALIZED VIEW IF NOT EXISTS nft_contract_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  contract_account_id AS contract,
  COUNT(*) FILTER (
    WHERE
      delta_amount > 0
      OR (
        delta_amount < 0
        AND cause = 'BURN'
      )
  ) AS transfers_count,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount > 0 THEN affected_account_id
    END
  ) AS unique_receivers,
  COUNT(
    DISTINCT CASE
      WHEN delta_amount < 0 THEN affected_account_id
    END
  ) AS unique_senders,
  COUNT(DISTINCT affected_account_id) AS unique_accounts
FROM
  nft_events
GROUP BY
  date,
  contract
ORDER BY
  date,
  contract
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'nft_contract_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ncs_contract_date_idx ON nft_contract_stats (contract, date DESC);

DROP MATERIALIZED VIEW IF EXISTS account_nft_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS account_nft_stats
WITH
  (timescaledb.continuous) AS
SELECT
  TIME_BUCKET (86400000000000, block_timestamp) AS date, -- 1d in ns
  affected_account_id AS account,
  COUNT(DISTINCT contract_account_id) AS contracts,
  COUNT(*) AS transfers,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount < 0
  ) AS unique_address_out,
  COUNT(DISTINCT involved_account_id) FILTER (
    WHERE
      delta_amount > 0
  ) AS unique_address_in
FROM
  nft_events
GROUP BY
  date,
  account
ORDER BY
  date,
  account
WITH
  NO DATA;

SELECT
  add_continuous_aggregate_policy (
    'account_nft_stats',
    start_offset => BIGINT '259200000000000', -- 3d in ns
    end_offset => BIGINT '3600000000000', -- 1h in ns
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => true
  );

CREATE INDEX IF NOT EXISTS ca_ans_account_idx ON account_nft_stats (account);
