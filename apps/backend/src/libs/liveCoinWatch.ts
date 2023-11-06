import axios from 'axios';

import config from '#config';
import log from '#libs/log';
import sentry from '#libs/sentry';
import { FtMarketData } from '#types/types';

const marketData = async (id: string): Promise<FtMarketData | null> => {
  try {
    const price = await axios.post(
      'https://api.livecoinwatch.com/coins/single',
      {
        code: id,
        currency: 'USD',
        meta: true,
      },
      {
        headers: {
          'x-api-key': config.lcwApiKey,
        },
        timeout: 10000,
      },
    );

    return {
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
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
    return null;
  }
};

const marketSearch = async (contract: string): Promise<null | string> => {
  try {
    let platform = 'NEAR';
    let address = contract;

    if (contract.endsWith('.factory.bridge.near')) {
      platform = 'ETH';
      address = `0x${contract.split('.')[0]}`;
    }

    const coin = await axios.post(
      'https://api.livecoinwatch.com/coins/contract',
      {
        address,
        currency: 'USD',
        meta: false,
        platform,
      },
      {
        headers: {
          'x-api-key': config.lcwApiKey,
        },
        timeout: 10000,
      },
    );

    return coin?.data?.code ?? null;
  } catch (error) {
    return null;
  }
};

export default { marketData, marketSearch };
