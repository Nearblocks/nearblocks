SELECT
  v.account_id,
  v.accumulated_stake_percent,
  v.after_next_epoch_stake,
  v.contract_stake,
  v.cumulative_stake_percent,
  v.current_epoch_blocks_expected,
  v.current_epoch_blocks_produced,
  v.current_epoch_chunks_expected,
  v.current_epoch_chunks_produced,
  v.current_epoch_stake,
  v.delegators_count,
  v.fee_denominator,
  v.fee_numerator,
  v.is_network_holder_warning,
  v.next_epoch_stake,
  v.own_stake_percent,
  v.public_key,
  v.stake_change_symbol,
  v.stake_change_value,
  v.staking_status,
  m.city,
  m.country,
  m.country_code,
  m.description,
  m.discord,
  m.email,
  m.github,
  m.logo,
  m.name,
  m.telegram,
  m.twitter,
  m.url
FROM
  validator_epoch_data v
  LEFT JOIN validator_pool_metadata m ON m.account_id = v.account_id
WHERE
  NOT ${has_cursor}
  OR (
    ${direction} = 'desc'
    AND (
      (
        ${cursor.stake}::NUMERIC IS NOT NULL
        AND (
          v.current_epoch_stake::NUMERIC < ${cursor.stake}::NUMERIC
          OR (
            v.current_epoch_stake::NUMERIC = ${cursor.stake}::NUMERIC
            AND v.account_id > ${cursor.account_id}
          )
          OR v.current_epoch_stake IS NULL
        )
      )
      OR (
        ${cursor.stake}::NUMERIC IS NULL
        AND v.current_epoch_stake IS NULL
        AND v.account_id > ${cursor.account_id}
      )
    )
  )
  OR (
    ${direction} = 'asc'
    AND (
      (
        ${cursor.stake}::NUMERIC IS NOT NULL
        AND (
          v.current_epoch_stake::NUMERIC > ${cursor.stake}::NUMERIC
          OR (
            v.current_epoch_stake::NUMERIC = ${cursor.stake}::NUMERIC
            AND v.account_id < ${cursor.account_id}
          )
        )
      )
      OR (
        ${cursor.stake}::NUMERIC IS NULL
        AND (
          v.current_epoch_stake IS NOT NULL
          OR (
            v.current_epoch_stake IS NULL
            AND v.account_id < ${cursor.account_id}
          )
        )
      )
    )
  )
ORDER BY
  v.current_epoch_stake::NUMERIC ${stakeDir:raw} NULLS ${nullsOrd:raw},
  v.account_id ${accountDir:raw}
LIMIT
  ${limit}
