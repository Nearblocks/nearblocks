import axios from 'axios';
import get from 'lodash/get.js';

import config from '#config';
import log from '#libs/log';
import sentry from '#libs/sentry';
import { FtMarketData } from '#types/types';

const marketData = async (id: string): Promise<FtMarketData | null> => {
  try {
    const price = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${id}&convert=usd`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': config.cmcApiKey,
        },
        timeout: 10000,
      },
    );
    const meta = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${id}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': config.cmcApiKey,
        },
        timeout: 10000,
      },
    );

    return {
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
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
    return null;
  }
};

const marketSearch = async (address: string): Promise<null | string> => {
  try {
    const coin = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?address=${address}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': config.cmcApiKey,
        },
        timeout: 10000,
      },
    );
    const resp: unknown = Object.values(coin?.data?.data) ?? [];
    const id = get(resp, '0.id');

    return id ?? null;
  } catch (error) {
    return null;
  }
};

export default { marketData, marketSearch };
