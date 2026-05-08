SELECT
  account_id
FROM
  accounts
WHERE
  search @@ TO_TSQUERY(${account} || ':*')
ORDER BY
  (account_id LIKE ${account} || '%') DESC,
  (account_id LIKE ${account} || '.%') DESC,
  LENGTH(account_id) ASC,
  TS_RANK(search, TO_TSQUERY(${account} || ':*')) DESC
LIMIT
  5
