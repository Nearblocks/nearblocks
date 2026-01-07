SELECT
  contract
FROM
  nft_meta
WHERE
  contract = ${contract}
LIMIT
  1
