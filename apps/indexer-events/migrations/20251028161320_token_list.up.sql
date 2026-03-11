CREATE MATERIALIZED VIEW nft_token_list AS
SELECT
  contract,
  COUNT(*) as tokens
FROM
  nft_token_meta
WHERE
  modified_at IS NOT NULL
GROUP BY
  contract;

CREATE UNIQUE INDEX ON nft_token_list (contract);

CREATE MATERIALIZED VIEW ft_list AS
SELECT
  contract,
  name,
  symbol,
  decimals,
  icon,
  reference,
  price,
  total_supply,
  ROUND((price)::NUMERIC * (total_supply)::NUMERIC) AS onchain_market_cap,
  change_24h,
  market_cap,
  volume_24h
FROM
  ft_meta
WHERE
  modified_at IS NOT NULL;

CREATE UNIQUE INDEX ON ft_list (contract);

CREATE MATERIALIZED VIEW nft_list AS
SELECT
  m.contract,
  m.name,
  m.symbol,
  m.icon,
  m.base_uri,
  m.reference,
  COALESCE(t.tokens, 0) AS tokens,
  COALESCE(dt.transfers, 0) AS transfers_24h
FROM
  nft_meta m
  LEFT JOIN LATERAL (
    SELECT
      tokens
    FROM
      nft_token_list
    WHERE
      contract = m.contract
  ) t ON true
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS transfers
    FROM
      nft_events
    WHERE
      contract_account_id = m.contract
      AND block_timestamp > (
        EXTRACT(
          epoch
          FROM
            NOW() - INTERVAL '1 day'
        ) * 1000000000
      )::BIGINT
  ) dt ON true
WHERE
  m.modified_at IS NOT NULL;

CREATE UNIQUE INDEX ON nft_list (contract);
