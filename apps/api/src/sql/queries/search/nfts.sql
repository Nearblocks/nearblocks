SELECT
  contract,
  name,
  symbol,
  icon
FROM
  nft_list
WHERE
  contract = ${contract}
  OR LOWER(symbol) = ${keyword}
ORDER BY
  (contract = ${contract}) DESC,
  tokens DESC NULLS LAST
LIMIT
  5
