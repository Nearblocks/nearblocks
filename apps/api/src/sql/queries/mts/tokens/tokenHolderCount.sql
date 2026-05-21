SELECT
  COUNT(*)
FROM
  mt_holders
WHERE
  contract = ${contract}
  AND token = ${token}
  AND amount > 0
