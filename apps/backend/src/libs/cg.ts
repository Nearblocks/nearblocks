import axios, { AxiosResponse } from 'axios';

import { logger } from 'nb-logger';

import config from '#config';
import { CGCoin, FTCoin, FTMarketData } from '#types/types';

const coinList = async (): Promise<FTCoin[]> => {
  let coin: AxiosResponse<CGCoin[]> | null = null;

  try {
    coin = await axios.get<CGCoin[]>(
      `https://pro-api.coingecko.com/api/v3/coins/list?include_platform=true&x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 60000 },
    );
  } catch (error) {
    // logger.error(error);
  }

  const contracts = coin?.data
    ?.filter((coin) => coin?.platforms?.['near-protocol'])
    .map((coin) => ({
      contract: coin.platforms['near-protocol'],
      id: coin.id,
    }));

  return Array.isArray(contracts) ? contracts : [];
};

const marketData = async (id: string, full = false) => {
  try {
    const price = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 60000 },
    );

    const data: FTMarketData = {
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

    if (full) {
      data.high_24h = price?.data?.market_data?.high_24h?.usd || null;
      data.high_all = price?.data?.market_data?.ath?.usd || null;
      data.low_24h = price?.data?.market_data?.low_24h?.usd || null;
      data.low_all = price?.data?.market_data?.atl?.usd || null;
    }

    return data;
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

const marketHistory = async (
  date: string,
): Promise<null | Pick<FTMarketData, 'market_cap' | 'price'>> => {
  try {
    const price = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/near/history?date=${date}&localization=false&x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 60000 },
    );

    return {
      market_cap: price?.data?.market_data?.market_cap?.usd ?? null,
      price: price?.data?.market_data?.current_price?.usd ?? null,
    };
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

const marketSearch = async (address: string): Promise<null | string> => {
  let contract = address;
  let platform = 'near-protocol';

  if (address.endsWith('.factory.bridge.near')) {
    platform = 'ethereum';
    contract = `0x${address.split('.')[0]}`;
  }

  try {
    const coin = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${platform}/contract/${contract}?x_cg_pro_api_key=${config.coingeckoApiKey}`,
      { timeout: 60000 },
    );

    return coin?.data?.id ?? null;
  } catch (error) {
    // logger.error(error);

    return null;
  }
};

export default { coinList, marketData, marketHistory, marketSearch };
