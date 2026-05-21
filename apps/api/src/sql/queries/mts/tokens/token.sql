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
  mtm.description,
  mtm.expires_at::TEXT,
  mtm.issued_at::TEXT,
  mtm.starts_at::TEXT,
  mtm.updated_at::TEXT,
  mtm.extra,
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
  AND mbm.token = ${token}
