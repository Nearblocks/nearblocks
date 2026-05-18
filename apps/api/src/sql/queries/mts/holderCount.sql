SELECT
  COUNT(*)
FROM
  mt_holders
WHERE
  contract = ${contract}
  AND amount > 0
  AND (
    ${token}::TEXT IS NULL
    OR token = ${token}
  )
