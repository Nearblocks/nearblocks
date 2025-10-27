import axios from 'axios';

import config from '#config';
import { CMCInfo, CMCMarketData, CMCQuote } from '#types/types';

const search = async (contract: string) => {
  try {
    const info = await axios.get<CMCInfo>(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?address=${contract}`,
      { headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey }, timeout: 60000 },
    );

    if (info?.data?.data) {
      const id = Object.keys(info.data.data)[0];
      const quote = await axios.get<CMCQuote>(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${id}`,
        {
          headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey },
          timeout: 60000,
        },
      );

      return getData(id, info.data, quote.data);
    }

    return null;
  } catch (error) {
    // logger.error(`tokenMarket: cmc.search: ${contract}`);
    // logger.error(error);
    return null;
  }
};

const getData = (id: string, info: CMCInfo, quote: CMCQuote): CMCMarketData => {
  return {
    change_24h: quote?.data?.[id]?.quote?.USD?.percent_change_24h ?? null,
    circulating_supply: quote?.data?.[id]?.circulating_supply ?? null,
    coinmarketcap_id: id,
    description: info?.data?.[id]?.description ?? null,
    facebook: null,
    fully_diluted_market_cap:
      quote?.data?.[id]?.quote?.USD?.fully_diluted_market_cap ?? null,
    market_cap: quote?.data?.[id]?.quote?.USD?.market_cap ?? null,
    reddit: info?.data?.[id]?.urls?.reddit?.[0] ?? null,
    telegram: null,
    twitter: info?.data?.[id]?.urls?.twitter?.[0] ?? null,
    volume_24h: quote?.data?.[id]?.quote?.USD?.volume_24h ?? null,
    website: info?.data?.[id]?.urls?.website?.[0] ?? null,
  };
};

export default { search };
