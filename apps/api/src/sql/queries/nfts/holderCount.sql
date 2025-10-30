SELECT
  COUNT(*)
FROM
  nft_holders
WHERE
  contract = ${contract}
  AND quantity > 0
