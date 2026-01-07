SELECT
  nh.contract,
  nh.token,
  JSONB_BUILD_OBJECT(
    'contract',
    nm.contract,
    'name',
    nm.name,
    'symbol',
    nm.symbol,
    'base_uri',
    nm.base_uri,
    'icon',
    nm.icon,
    'reference',
    nm.reference
  ) AS meta,
  JSONB_BUILD_OBJECT(
    'contract',
    ntm.contract,
    'token',
    ntm.token,
    'title',
    ntm.title,
    'media',
    ntm.media,
    'reference',
    ntm.reference
  ) AS token_meta
FROM
  nft_holders nh
  JOIN nft_meta nm ON nm.contract = nh.contract
  JOIN nft_token_meta ntm ON ntm.contract = nh.contract
  AND ntm.token = nh.token
WHERE
  nh.account = ${account}
  AND nh.quantity > 0
  AND (
    (
      ${cursor.token}::TEXT IS NULL
      AND ${cursor.contract}::TEXT IS NULL
    )
    OR (nh.token < ${cursor.token}::TEXT)
    OR (
      nh.token = ${cursor.token}::TEXT
      AND nh.contract > ${cursor.contract}::TEXT
    )
  )
ORDER BY
  nh.token DESC,
  nh.contract ASC
LIMIT
  ${limit}
