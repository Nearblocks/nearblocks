import axios from 'axios';

import { logger } from 'nb-logger';

import { FTMarketData } from '#types/types';

const marketData = async (contract: string) => {
  try {
    const resp = await axios.get(
      `https://indexer.ref.finance/list-token-price`,
      {
        timeout: 10000,
      },
    );

    const token = resp?.data?.[contract];

    if (!token) return null;

    const data: FTMarketData = {
      change_24: null,
      circulating_supply: null,
      description: null,
      facebook: null,
      fully_diluted_market_cap: null,
      market_cap: null,
      price: token?.price ?? null,
      price_btc: null,
      price_eth: null,
      reddit: null,
      telegram: null,
      twitter: null,
      volume_24h: null,
      website: null,
    };

    return data;
  } catch (error) {
    logger.error(error);

    return null;
  }
};

export default { marketData };
