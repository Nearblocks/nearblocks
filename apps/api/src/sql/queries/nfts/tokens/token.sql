SELECT
  contract,
  token,
  holder.account AS owner,
  title,
  media,
  reference,
  copies,
  description,
  expires_at,
  extra,
  issued_at,
  starts_at,
  updated_at
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
  AND token = ${token}
  AND modified_at IS NOT NULL
