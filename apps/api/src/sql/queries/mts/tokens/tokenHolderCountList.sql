SELECT
  holders::TEXT AS count
FROM
  mt_list
WHERE
  contract = ${contract}
  AND token = ${token}
