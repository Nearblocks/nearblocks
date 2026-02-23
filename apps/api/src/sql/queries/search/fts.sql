SELECT
  contract
FROM
  ft_meta
WHERE
  (
    (
      ${hex}::TEXT IS NOT NULL
      AND hex_address = ${hex}
    )
    OR (
      ${hex}::TEXT IS NULL
      AND contract = ${contract}
    )
  )
  AND modified_at IS NOT NULL
LIMIT
  1
