SELECT
  COUNT(*)::TEXT AS count
FROM
  mt_base_meta
WHERE
  contract = ${contract}
  AND modified_at IS NOT NULL
  AND (
    ${type}::TEXT IS NULL
    OR (
      ${type} = 'ft'
      AND decimals IS NOT NULL
    )
    OR (
      ${type} = 'nft'
      AND decimals IS NULL
    )
  )
