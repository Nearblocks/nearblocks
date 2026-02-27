SELECT
  COUNT(*)::TEXT AS count
FROM
  nft_token_meta
WHERE
  contract = ${contract}
  AND modified_at IS NOT NULL
