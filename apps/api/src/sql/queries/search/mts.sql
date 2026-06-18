SELECT
  contract,
  token
FROM
  mt_list
WHERE
  token = ${keyword}
ORDER BY
  transfers DESC
LIMIT
  5
