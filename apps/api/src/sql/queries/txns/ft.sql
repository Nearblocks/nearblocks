SELECT
  ft.receipt_id,
  ft.contract_account_id,
  ft.affected_account_id,
  ft.involved_account_id,
  ft.cause,
  ft.delta_amount,
  ft.block_timestamp,
  ft.shard_id,
  ft.event_type,
  ft.event_index,
  m.meta
FROM
  ft_events ft
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'name',
        name,
        'symbol',
        symbol,
        'decimals',
        decimals,
        'icon',
        icon,
        'reference',
        reference
      ) AS meta
    FROM
      ft_meta fm
    WHERE
      fm.contract = ft.contract_account_id
  ) m ON TRUE
WHERE
  ft.receipt_id = ${receipt_id}::TEXT
  AND ft.block_timestamp = ${block_timestamp}::BIGINT
