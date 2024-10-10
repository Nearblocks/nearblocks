CREATE TABLE validator_data (
  id SERIAL NOT NULL,
  latest_block JSONB,
  protocol_config JSONB,
  genesis_config JSONB,
  pool_ids JSONB,
  validators_promise JSONB,
  stake_proposals JSONB,
  staking_pool_infos JSONB,
  validator_lists JSONB,
  mapped_validators JSONB,
  current_validators JSONB,
  epoch_stats_check JSONB,
  epoch_start_block JSONB,
  staking_pool_metadata JSONB,
  validator_telemetry JSONB,
  PRIMARY KEY (id)
);

INSERT INTO
  validator_data (id)
VALUES
  (1);
