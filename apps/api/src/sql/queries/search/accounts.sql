SELECT
  account_id
FROM
  accounts
WHERE
  account_id = ${account}
  OR search @@ TO_TSQUERY(${account} || ':*')
ORDER BY
  (account_id = ${account}) DESC,
  (account_id LIKE ${account} || '%') DESC,
  (account_id LIKE ${account} || '.%') DESC,
  LENGTH(account_id) ASC,
  TS_RANK(search, TO_TSQUERY(${account} || ':*')) DESC
LIMIT
  5
