SELECT
  mbm.contract,
  mbm.token,
  mbm.name,
  mbm.symbol,
  mbm.decimals,
  mbm.icon,
  mbm.base_uri,
  mbm.copies,
  mbm.reference,
  mtm.title,
  mtm.media,
  mtm.price::TEXT,
  holder.account AS owner
FROM
  mt_base_meta mbm
  LEFT JOIN mt_token_meta mtm USING (contract, token)
  LEFT JOIN LATERAL (
    SELECT
      account
    FROM
      mt_holders
    WHERE
      contract = mbm.contract
      AND token = mbm.token
      AND amount > 0
    LIMIT
      1
  ) holder ON TRUE
WHERE
  mbm.contract = ${contract}
  AND mbm.modified_at IS NOT NULL
  AND (
    ${type}::TEXT IS NULL
    OR (
      ${type} = 'ft'
      AND mbm.decimals IS NOT NULL
    )
    OR (
      ${type} = 'nft'
      AND mbm.decimals IS NULL
    )
  )
  AND (
    ${cursor.token}::TEXT IS NULL
    OR mbm.token > ${cursor.token}
  )
ORDER BY
  mbm.token ASC
LIMIT
  ${limit}
