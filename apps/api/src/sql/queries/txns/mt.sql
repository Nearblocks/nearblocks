SELECT
  mt.receipt_id,
  mt.contract_account_id,
  mt.affected_account_id,
  mt.involved_account_id,
  mt.token_id,
  mt.cause,
  mt.delta_amount,
  mt.block_timestamp,
  mt.shard_id,
  mt.event_index,
  m.meta,
  bm.base_meta,
  tm.token_meta
FROM
  mt_events mt
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT('contract', contract, 'name', name, 'spec', spec) AS meta
    FROM
      mt_meta mm
    WHERE
      mm.contract = mt.contract_account_id
  ) m ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'name',
        name,
        'symbol',
        symbol,
        'decimals',
        decimals,
        'base_uri',
        base_uri,
        'icon',
        icon,
        'reference',
        reference,
        'price',
        (
          SELECT
            (
              CASE
                WHEN (${block_timestamp}::BIGINT / 1000000 / 86400000) = (
                  EXTRACT(
                    EPOCH
                    FROM
                      NOW()
                  )::BIGINT * 1000 / 86400000
                ) THEN (
                  SELECT
                    price
                  FROM
                    ft_prices fp
                  WHERE
                    fp.coingecko_id = it.coingecko_id
                    AND fp.date <= ${block_timestamp}::BIGINT / 1000000
                  ORDER BY
                    fp.date DESC
                  LIMIT
                    1
                )
                ELSE (
                  SELECT
                    price
                  FROM
                    ft_prices_daily fpd
                  WHERE
                    fpd.coingecko_id = it.coingecko_id
                    AND fpd.date <= ${block_timestamp}::BIGINT / 1000000
                  ORDER BY
                    fpd.date DESC
                  LIMIT
                    1
                )
              END
            )::TEXT
          FROM
            mt_intents_tokens it
          WHERE
            it.token = mbm.token
        )
      ) AS base_meta
    FROM
      mt_base_meta mbm
    WHERE
      mbm.contract = mt.contract_account_id
      AND mbm.token = mt.token_id
      AND mbm.modified_at IS NOT NULL
  ) bm ON TRUE
  JOIN LATERAL (
    SELECT
      JSONB_BUILD_OBJECT(
        'contract',
        contract,
        'token',
        token,
        'title',
        title,
        'media',
        media,
        'reference',
        reference
      ) AS token_meta
    FROM
      mt_token_meta mtm
    WHERE
      mtm.contract = mt.contract_account_id
      AND mtm.token = mt.token_id
      AND mtm.modified_at IS NOT NULL
  ) tm ON TRUE
WHERE
  mt.receipt_id = ${receipt_id}::TEXT
  AND mt.block_timestamp <= ${block_timestamp}::BIGINT
  AND mt.block_timestamp >= ${block_timestamp}::BIGINT - 300000000000 -- 5m in ns
