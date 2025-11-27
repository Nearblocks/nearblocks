import axios from 'axios';

import config from '#config';
import { FTMarketData } from '#types/types';

const marketData = async (id: string, full = false) => {
  try {
    const [price, meta] = await Promise.all([
      axios.get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${id}&convert=usd`,
        {
          headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey },
          timeout: 60000,
        },
      ),
      axios.get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${id}`,
        {
          headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey },
          timeout: 60000,
        },
      ),
    ]);

    const data: FTMarketData = {
      change_24:
        price?.data?.data?.[id]?.quote?.USD?.percent_change_24h ?? null,
      circulating_supply: price?.data?.data?.[id]?.circulating_supply ?? null,
      description: meta?.data?.data?.[id]?.description ?? null,
      facebook: null,
      fully_diluted_market_cap:
        price?.data?.data?.[id]?.quote?.USD?.fully_diluted_market_cap ?? null,
      market_cap: price?.data?.data?.[id]?.quote?.USD?.market_cap ?? null,
      price: price?.data?.data?.[id]?.quote?.USD?.price ?? null,
      price_btc: null,
      price_eth: null,
      reddit: meta?.data?.data?.[id]?.urls?.reddit?.[0] ?? null,
      telegram: null,
      twitter: meta?.data?.data?.[id]?.urls?.twitter?.[0] ?? null,
      volume_24h: price?.data?.data?.[id]?.quote?.USD?.volume_24h ?? null,
      website: meta?.data?.data?.[id]?.urls?.website?.[0] ?? null,
    };

    if (full) {
      data.high_24h = null;
      data.high_all = null;
      data.low_24h = null;
      data.low_all = null;
    }

    return data;
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

const marketSearch = async (address: string) => {
  try {
    const coin = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?address=${address}`,
      {
        headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey },
        timeout: 60000,
      },
    );

    return coin?.data?.data ? Object.keys(coin?.data?.data)?.[0] : null;
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

export default { marketData, marketSearch };
