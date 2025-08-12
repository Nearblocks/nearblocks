SELECT
  contract
FROM
  ft_meta
WHERE
  (
    ${hex}::TEXT IS NOT NULL
    AND hex_address = ${hex}
  )
  OR (
    ${hex}::TEXT IS NULL
    AND contract = ${contract}
  )
LIMIT
  1
