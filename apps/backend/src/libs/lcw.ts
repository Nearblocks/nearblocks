import { default as axios } from 'axios';
import Big from 'big.js';

import { logger } from 'nb-logger';

import config from '#config';
import { FTMarketData } from '#types/types';

const getBtcPrice = async (price: number) => {
  const resp = await axios.post(
    'https://api.livecoinwatch.com/coins/single',
    { code: 'BTC', currency: 'USD', meta: true },
    {
      headers: { 'x-api-key': config.lcwApiKey },
      timeout: 60000,
    },
  );

  const btcPrice = resp?.data?.rate ?? null;

  if (!btcPrice) null;

  return Big(price).div(Big(btcPrice)).toString();
};

const marketData = async (id: string, full = false) => {
  try {
    let btcPrice = null;
    const price = await axios.post(
      'https://api.livecoinwatch.com/coins/single',
      { code: id, currency: 'USD', meta: true },
      {
        headers: { 'x-api-key': config.lcwApiKey },
        timeout: 60000,
      },
    );

    if (price?.data?.rate && id === 'NEAR') {
      btcPrice = await getBtcPrice(price?.data?.rate);
    }

    const data: FTMarketData = {
      change_24: price?.data?.delta?.day ?? null,
      circulating_supply: price?.data?.circulatingSupply ?? null,
      description: null,
      facebook: null,
      fully_diluted_market_cap: null,
      market_cap: price?.data?.cap ?? null,
      price: price?.data?.rate ?? null,
      price_btc: btcPrice,
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
    // logger.error(error);

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
        timeout: 60000,
      },
    );

    return {
      market_cap: price?.data?.history?.[0]?.cap ?? null,
      price: price?.data?.history?.[0]?.rate ?? null,
    };
  } catch (error) {
    // logger.error(error);

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
        timeout: 60000,
      },
    );

    return coin?.data?.code ?? null;
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

export default { marketData, marketHistory, marketSearch };
