SELECT
  COUNT(nh.account)
FROM
  nft_holders nh
  JOIN nft_meta nm ON nm.contract = nh.contract
  JOIN nft_token_meta ntm ON ntm.contract = nh.contract
  AND ntm.token = nh.token
WHERE
  nh.account = ${account}
  AND nh.quantity > 0
