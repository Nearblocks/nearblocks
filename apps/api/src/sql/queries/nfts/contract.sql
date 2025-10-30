SELECT
  contract,
  name,
  symbol,
  icon,
  spec,
  base_uri,
  reference,
  reference_hash,
  description,
  modified_at
FROM
  nft_meta
WHERE
  contract = ${contract}
