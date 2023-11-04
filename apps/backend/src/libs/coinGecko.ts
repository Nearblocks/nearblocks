/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import config from '#config';
import log from '#libs/log';
import sentry from '#libs/sentry';
import { FtMarketData } from '#types/types';

interface Coin {
  contract: string;
  id: string;
}

const marketData = async (id: string): Promise<FtMarketData | null> => {
  try {
    const price = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 10000 },
    );

    return {
      change_24: price?.data?.market_data?.price_change_percentage_24h ?? null,
      circulating_supply: price?.data?.market_data?.circulating_supply ?? null,
      description: price?.data?.description?.en ?? null,
      facebook: price?.data?.links?.facebook_username ?? null,
      fully_diluted_market_cap:
        price?.data?.market_data?.fully_diluted_valuation?.usd ?? null,
      market_cap: price?.data?.market_data?.market_cap?.usd ?? null,
      price: price?.data?.market_data?.current_price?.usd ?? null,
      price_btc: price?.data?.market_data?.current_price?.btc ?? null,
      price_eth: price?.data?.market_data?.current_price?.eth ?? null,
      reddit: price?.data?.links?.subreddit_url ?? null,
      telegram: price?.data?.links?.telegram_channel_identifier ?? null,
      twitter: price?.data?.links?.twitter_screen_name ?? null,
      volume_24h: price?.data?.market_data?.total_volume?.usd ?? null,
      website: price?.data?.links?.homepage[0] ?? null,
    };
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
    return null;
  }
};

const marketSearch = async (address: string): Promise<null | string> => {
  try {
    let contract = address;
    let platform = 'near-protocol';

    if (address.endsWith('.factory.bridge.near')) {
      platform = 'ethereum';
      contract = `0x${address.split('.')[0]}`;
    }

    const coin = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${platform}/contract/${contract}?x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 10000 },
    );

    return coin?.data?.id ?? null;
  } catch (error) {
    return null;
  }
};

const coinList = async (): Promise<Coin[]> => {
  try {
    const coin = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/list?include_platform=true&x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 60000 },
    );

    const contracts = coin?.data
      ?.filter((coin: any) => coin?.platforms?.['near-protocol'])
      .map((coin: any) => ({
        contract: coin.platforms['near-protocol'],
        id: coin.id,
      }));

    return Array.isArray(contracts) ? contracts : [];
  } catch (error) {
    return [];
  }
};

export default { coinList, marketData, marketSearch };
