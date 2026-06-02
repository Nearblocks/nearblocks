SELECT
  COUNT(mh.account)
FROM
  mt_holders mh
  LEFT JOIN mt_base_meta mbm ON mbm.contract = mh.contract
  AND mbm.token = mh.token
  AND mbm.modified_at IS NOT NULL
  LEFT JOIN mt_token_meta mtm ON mtm.contract = mh.contract
  AND mtm.token = mh.token
  AND mtm.modified_at IS NOT NULL
WHERE
  mh.account = ${account}
  AND mh.amount > 0
  AND mbm.decimals IS NOT NULL
