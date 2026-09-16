SELECT
  account_id
FROM
  accounts
WHERE
  account_id = ${account}
  OR search @@ (QUOTE_LITERAL(${account}) || ':*')::TSQUERY
ORDER BY
  (account_id = ${account}) DESC,
  (account_id LIKE ${account} || '%') DESC,
  (account_id LIKE ${account} || '.%') DESC,
  LENGTH(account_id) ASC,
  TS_RANK(
    search,
    (QUOTE_LITERAL(${account}) || ':*')::TSQUERY
  ) DESC
LIMIT
  5
