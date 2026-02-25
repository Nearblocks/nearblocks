SELECT
  fm.decimals,
  fm.price,
  fm.market_cap,
  fm.fully_diluted_market_cap,
  fm.total_supply,
  fm.circulating_supply,
  fm.contract,
  fm.hex_address,
  fm.name,
  fm.symbol,
  fm.icon,
  fm.spec,
  fm.reference,
  fm.reference_hash,
  fm.description,
  fm.website,
  fm.twitter,
  fm.facebook,
  fm.telegram,
  fm.reddit,
  fm.coingecko_id,
  fm.coinmarketcap_id,
  fm.volume_24h,
  fm.change_24h,
  fl.onchain_market_cap,
  fl.holders
FROM
  ft_meta fm
  LEFT JOIN ft_list fl ON fl.contract = fm.contract
WHERE
  fm.contract = ${contract}
  AND fm.modified_at IS NOT NULL
