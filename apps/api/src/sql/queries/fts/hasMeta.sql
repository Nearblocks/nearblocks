SELECT
  1
FROM
  ft_meta
WHERE
  contract = ${contract}
  AND modified_at IS NOT NULL
LIMIT
  1
