SELECT
  contract,
  name,
  symbol,
  decimals,
  icon
FROM
  ft_list
WHERE
  contract = ${contract}
  OR LOWER(symbol) = ${keyword}
ORDER BY
  (contract = ${contract}) DESC,
  market_cap DESC NULLS LAST
LIMIT
  5
