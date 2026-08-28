SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      mt_holders
    WHERE
      contract = ${contract}
      AND token = ${token}
      AND amount > 0
    LIMIT
      ${limit}::INT
  ) t
