SELECT
  contract
FROM
  nft_meta
WHERE
  contract = ${contract}
  AND modified_at IS NOT NULL
LIMIT
  1
