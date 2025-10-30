SELECT
  COUNT(*)
FROM
  nft_list
WHERE
  ${search} IS NULL
  OR contract ILIKE ${search}
  OR symbol ILIKE ${search}
  OR name ILIKE ${search}
