SELECT
  COUNT(*)::TEXT AS count
FROM
  (
    SELECT
      1
    FROM
      nft_holders
    WHERE
      contract = ${contract}
      AND quantity > 0
    LIMIT
      ${limit}::INT
  ) t
