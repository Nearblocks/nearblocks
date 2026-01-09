SELECT
  fh.contract,
  fh.amount,
  JSONB_BUILD_OBJECT(
    'contract',
    fm.contract,
    'name',
    fm.name,
    'symbol',
    fm.symbol,
    'decimals',
    fm.decimals,
    'icon',
    fm.icon,
    'reference',
    fm.reference,
    'price',
    fm.price::TEXT
  ) AS meta
FROM
  ft_holders fh
  JOIN ft_meta fm ON fm.contract = fh.contract
WHERE
  fh.account = ${account}
  AND fh.amount > 0
  AND (
    (
      ${cursor.amount}::NUMERIC IS NULL
      AND ${cursor.contract}::TEXT IS NULL
    )
    OR (fh.amount < ${cursor.amount}::NUMERIC)
    OR (
      fh.amount = ${cursor.amount}::NUMERIC
      AND fh.contract > ${cursor.contract}::TEXT
    )
  )
ORDER BY
  fh.amount DESC,
  fh.contract ASC
LIMIT
  ${limit}
