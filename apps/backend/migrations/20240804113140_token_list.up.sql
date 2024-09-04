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
  (price)::NUMERIC * (total_supply)::NUMERIC AS onchain_market_cap,
  change_24,
  market_cap,
  volume_24h
FROM
  ft_meta;

CREATE UNIQUE INDEX ON ft_list (contract);

CREATE MATERIALIZED VIEW nft_list AS
WITH
  day_transfers AS (
    SELECT
      contract_account_id,
      COUNT(*) AS transfers_count
    FROM
      nft_events
    WHERE
      block_timestamp > EXTRACT(
        epoch
        FROM
          NOW() - '1 day'::INTERVAL
      ) * 1000 * 1000 * 1000
    GROUP BY
      contract_account_id
  )
SELECT
  nft_meta.contract,
  nft_meta.name,
  nft_meta.symbol,
  nft_meta.icon,
  nft_meta.base_uri,
  nft_meta.reference,
  (
    SELECT
      COUNT(contract)
    FROM
      nft_token_meta
    WHERE
      contract = nft_meta.contract
  ) AS tokens,
  (
    SELECT
      COUNT(DISTINCT account)
    FROM
      nft_holders
    WHERE
      contract = nft_meta.contract
  ) AS holders,
  COALESCE(transfers_count, 0) AS transfers_day
FROM
  nft_meta
  LEFT JOIN day_transfers ON nft_meta.contract = day_transfers.contract_account_id;

CREATE UNIQUE INDEX ON nft_list (contract);
