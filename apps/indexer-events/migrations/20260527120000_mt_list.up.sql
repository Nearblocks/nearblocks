CREATE MATERIALIZED VIEW IF NOT EXISTS mt_list AS
SELECT
  b.contract,
  b.token,
  b.name,
  b.symbol,
  b.decimals,
  b.icon,
  b.base_uri,
  b.reference,
  t.price,
  COALESCE(h.holders, 0) AS holders,
  COALESCE(ts.transfers, 0) AS transfers
FROM
  mt_base_meta b
  LEFT JOIN mt_token_meta t ON t.contract = b.contract
  AND t.token = b.token
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS holders
    FROM
      mt_holders
    WHERE
      contract = b.contract
      AND token = b.token
  ) h ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(transfers_count), 0) AS transfers
    FROM
      mt_token_stats
    WHERE
      contract = b.contract
      AND token = b.token
  ) ts ON true
WHERE
  b.modified_at IS NOT NULL
  AND b.decimals IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS mt_list_contract_token_idx ON mt_list (contract, token);
