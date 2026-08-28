SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      ft_holders
    WHERE
      contract = ${contract}
      AND amount > 0
    LIMIT
      ${limit}::INT
  ) t
