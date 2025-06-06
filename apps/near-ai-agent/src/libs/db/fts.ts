import sql from '../postgres';

export async function getFTMetaByContract(contractId: string) {
  const result = await sql`
    SELECT
      contract,
      name,
      symbol,
      decimals,
      icon,
      reference,
      price,
      change_24,
      market_cap,
      fully_diluted_market_cap,
      total_supply,
      volume_24h,
      description,
      twitter,
      facebook,
      telegram,
      reddit,
      website,
      coingecko_id,
      coinmarketcap_id,
      livecoinwatch_id,
      (ft_meta.price)::NUMERIC * (ft_meta.total_supply)::NUMERIC AS onchain_market_cap
    FROM
      ft_meta
    WHERE
      contract = ${contractId}
  `;

  return result?.[0] || null;
}
