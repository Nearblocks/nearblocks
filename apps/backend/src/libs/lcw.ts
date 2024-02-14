import { default as axios } from 'axios';

import { logger } from 'nb-logger';

import config from '#config';
import { FTMarketData } from '#types/types';

const marketData = async (id: string, full = false) => {
  try {
    const price = await axios.post(
      'https://api.livecoinwatch.com/coins/single',
      { code: id, currency: 'USD', meta: true },
      {
        headers: { 'x-api-key': config.lcwApiKey },
        timeout: 10000,
      },
    );

    const data: FTMarketData = {
      change_24: price?.data?.delta?.day ?? null,
      circulating_supply: price?.data?.circulatingSupply ?? null,
      description: null,
      facebook: null,
      fully_diluted_market_cap: null,
      market_cap: price?.data?.cap ?? null,
      price: price?.data?.rate ?? null,
      price_btc: null,
      price_eth: null,
      reddit: price?.data?.links?.reddit ?? null,
      telegram: price?.data?.links?.telegram ?? null,
      twitter: price?.data?.links?.twitter ?? null,
      volume_24h: price?.data?.volume ?? null,
      website: price?.data?.links?.website ?? null,
    };

    if (full) {
      data.high_24h = null;
      data.high_all = null;
      data.low_24h = null;
      data.low_all = null;
    }

    return data;
  } catch (error) {
    logger.error(error);

    return null;
  }
};

const marketHistory = async (
  timestamp: number,
): Promise<null | Pick<FTMarketData, 'market_cap' | 'price'>> => {
  try {
    const price = await axios.post(
      'https://api.livecoinwatch.com/coins/single/history',
      {
        code: 'NEAR',
        currency: 'USD',
        end: timestamp,
        meta: false,
        start: timestamp,
      },
      {
        headers: { 'x-api-key': config.lcwApiKey },
        timeout: 10000,
      },
    );

    return {
      market_cap: price?.data?.history?.[0]?.cap ?? null,
      price: price?.data?.history?.[0]?.rate ?? null,
    };
  } catch (error) {
    logger.error(error);

    return null;
  }
};

const marketSearch = async (contract: string): Promise<null | string> => {
  let platform = 'NEAR';
  let address = contract;

  if (contract.endsWith('.factory.bridge.near')) {
    platform = 'ETH';
    address = `0x${contract.split('.')[0]}`;
  }

  try {
    const coin = await axios.post(
      'https://api.livecoinwatch.com/coins/contract',
      { address, currency: 'USD', meta: false, platform },
      {
        headers: { 'x-api-key': config.lcwApiKey },
        timeout: 10000,
      },
    );

    return coin?.data?.code ?? null;
  } catch (error) {
    logger.error(error);

    return null;
  }
};

export default { marketData, marketHistory, marketSearch };
