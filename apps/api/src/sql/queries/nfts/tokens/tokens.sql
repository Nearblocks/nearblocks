SELECT
  contract,
  token,
  title,
  media,
  holder.account AS owner,
  reference
FROM
  nft_token_meta ntm
  JOIN LATERAL (
    SELECT
      account
    FROM
      nft_holders
    WHERE
      contract = ntm.contract
      AND token = ntm.token
      AND quantity > 0
    LIMIT
      1
  ) holder ON TRUE
WHERE
  contract = ${contract}
  AND modified_at IS NOT NULL
  AND (
    ${cursor.token}::TEXT IS NULL
    OR token > ${cursor.token}
  )
ORDER BY
  token ASC
LIMIT
  ${limit}
