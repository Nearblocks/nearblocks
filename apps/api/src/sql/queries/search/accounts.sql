SELECT
  account_id
FROM
  accounts
WHERE
  search @@ TO_TSQUERY(${account} || ':*')
ORDER BY
  TS_RANK(search, TO_TSQUERY(${account} || ':*')) DESC
LIMIT
  5
