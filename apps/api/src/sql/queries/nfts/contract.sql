SELECT
  nm.contract,
  nm.name,
  nm.symbol,
  nm.icon,
  nm.spec,
  nm.base_uri,
  nm.reference,
  nm.reference_hash,
  nm.description,
  nm.modified_at,
  nl.tokens,
  nl.holders,
  nl.transfers_24h
FROM
  nft_meta nm
  LEFT JOIN nft_list nl ON nl.contract = nm.contract
WHERE
  nm.contract = ${contract}
  AND nm.modified_at IS NOT NULL
