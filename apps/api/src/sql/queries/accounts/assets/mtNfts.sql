SELECT
  mh.contract,
  mh.token,
  mh.amount,
  CASE
    WHEN mbm.token IS NOT NULL THEN JSONB_BUILD_OBJECT(
      'contract',
      mbm.contract,
      'token',
      mbm.token,
      'name',
      mbm.name,
      'symbol',
      mbm.symbol,
      'decimals',
      mbm.decimals,
      'icon',
      mbm.icon,
      'reference',
      mbm.reference,
      'base_uri',
      mbm.base_uri
    )
  END AS meta,
  JSONB_BUILD_OBJECT(
    'contract',
    mtm.contract,
    'token',
    mtm.token,
    'title',
    mtm.title,
    'media',
    mtm.media,
    'reference',
    mtm.reference
  ) AS token_meta
FROM
  mt_holders mh
  LEFT JOIN mt_base_meta mbm ON mbm.contract = mh.contract
  AND mbm.token = mh.token
  AND mbm.modified_at IS NOT NULL
  JOIN mt_token_meta mtm ON mtm.contract = mh.contract
  AND mtm.token = mh.token
  AND mtm.modified_at IS NOT NULL
WHERE
  mh.account = ${account}
  AND mh.amount > 0
  AND mbm.decimals IS NULL
  AND (
    (
      ${cursor.token}::TEXT IS NULL
      AND ${cursor.contract}::TEXT IS NULL
    )
    OR (
      ${direction} = 'desc'
      AND (
        (mh.token < ${cursor.token}::TEXT)
        OR (
          mh.token = ${cursor.token}::TEXT
          AND mh.contract > ${cursor.contract}::TEXT
        )
      )
    )
    OR (
      ${direction} = 'asc'
      AND (
        (mh.token > ${cursor.token}::TEXT)
        OR (
          mh.token = ${cursor.token}::TEXT
          AND mh.contract < ${cursor.contract}::TEXT
        )
      )
    )
  )
ORDER BY
  mh.token ${direction:raw},
  mh.contract ${contractDirection:raw}
LIMIT
  ${limit}
