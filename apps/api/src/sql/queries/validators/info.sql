SELECT
  vc.epoch_seat_price,
  vc.epoch_start_height,
  vc.epoch_start_timestamp,
  vc.epoch_start_total_supply,
  vc.last_epoch_apy,
  vc.latest_block_height,
  vc.latest_block_timestamp,
  vc.network_holder_index,
  vc.protocol_epoch_length,
  vc.total_stake,
  (
    SELECT
      COUNT(*)::INT
    FROM
      validator_epoch_data
    WHERE
      staking_status IN ('active', 'leaving')
  ) AS current_validators_count,
  (
    SELECT
      COUNT(*)::INT
    FROM
      validator_epoch_data
  ) AS total_validators_count
FROM
  validator_config vc
WHERE
  vc.id = 1
LIMIT
  1
