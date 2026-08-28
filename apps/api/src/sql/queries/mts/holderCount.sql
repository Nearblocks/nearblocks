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
      AND amount > 0
      AND (
        ${token}::TEXT IS NULL
        OR token = ${token}
      )
    LIMIT
      ${limit}::INT
  ) t
