SELECT
  contract,
  token,
  name,
  symbol,
  decimals,
  icon
FROM
  mt_list
WHERE
  token = ${keyword}
ORDER BY
  transfers DESC
LIMIT
  5
