import axios from 'axios';

import { logger } from 'nb-logger';

import config from '#config';
import { CGInfo, CGMarketData, CGPriceData } from '#types/types';

const search = async (contract: string) => {
  let address = contract;
  let platform = 'near-protocol';

  if (contract.endsWith('.factory.bridge.near')) {
    platform = 'ethereum';
    address = `0x${contract.split('.')[0]}`;
  }

  try {
    // Demo api
    // const meta = await axios.get<CGInfo>(
    //   `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`,
    //   { headers: { 'x-cg-demo-api-key': config.cgApiKey }, timeout: 60000 },
    // );
    const meta = await axios.get<CGInfo>(
      `https://pro-api.coingecko.com/api/v3/coins/${platform}/contract/${address}`,
      { headers: { 'x-cg-pro-api-key': config.cgApiKey }, timeout: 60000 },
    );

    if (meta.data?.id) {
      return getData(meta.data.id, meta.data) as CGMarketData;
    }

    return null;
  } catch (error) {
    // logger.error(`tokenMarket: cg.search: ${contract}`);
    // logger.error(error);
    return null;
  }
};

const price = async (id: string) => {
  try {
    // Demo api
    // const resp = await axios.get<CGInfo>(
    //   `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
    //   { headers: { 'x-cg-demo-api-key': config.cgApiKey }, timeout: 60000 },
    // );
    const resp = await axios.get<CGInfo>(
      `https://pro-api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      { headers: { 'x-cg-pro-api-key': config.cgApiKey }, timeout: 60000 },
    );

    return getPriceData(resp.data);
  } catch (error) {
    logger.error(`stats: cg.price: ${id}`);
    logger.error(error);
    return null;
  }
};

const history = async (date: string) => {
  try {
    // Demo api
    // const resp = await axios.get<CGInfo>(
    //   `https://api.coingecko.com/api/v3/coins/near/history?date=24-10-2025&localization=false`,
    //   { headers: { 'x-cg-demo-api-key': config.cgApiKey }, timeout: 60000 },
    // );
    const resp = await axios.get<CGInfo>(
      `https://pro-api.coingecko.com/api/v3/coins/near/history?date=${date}&localization=false`,
      { headers: { 'x-cg-pro-api-key': config.cgApiKey }, timeout: 60000 },
    );

    return getPriceData(resp.data);
  } catch (error) {
    logger.error(`dailyStats: cg.history: ${date}`);
    logger.error(error);
    return null;
  }
};

const getData = (id: string, data: CGInfo): CGMarketData => {
  return {
    change_24h: data?.market_data?.price_change_percentage_24h ?? null,
    circulating_supply: data?.market_data?.circulating_supply ?? null,
    coingecko_id: id,
    description: data?.description?.en ?? null,
    facebook: data?.links?.facebook_username ?? null,
    fully_diluted_market_cap:
      data?.market_data?.fully_diluted_valuation?.usd ?? null,
    market_cap: data?.market_data?.market_cap?.usd ?? null,
    reddit: data?.links?.subreddit_url ?? null,
    telegram: data?.links?.telegram_channel_identifier ?? null,
    twitter: data?.links?.twitter_screen_name ?? null,
    volume_24h: data?.market_data?.total_volume?.usd ?? null,
    website: data?.links?.homepage?.[0] ?? null,
  };
};

const getPriceData = (data: CGInfo): CGPriceData => {
  return {
    change_24h: data?.market_data?.price_change_percentage_24h ?? null,
    market_cap: data?.market_data?.market_cap?.usd ?? null,
    price: data?.market_data?.current_price?.usd ?? null,
    price_btc: data?.market_data?.current_price?.btc ?? null,
    volume_24h: data?.market_data?.total_volume?.usd ?? null,
  };
};

export default { history, price, search };
