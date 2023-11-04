import axios from 'axios';
import { Big } from 'big.js';

import knex from '#libs/knex';
import { validators } from '#libs/near';
import { msToNsTime } from '#libs/utils';

const blockTime = async (timestamp: string) => {
  const start = Big(timestamp)
    .minus(Big(msToNsTime(60000)))
    .toFixed();

  const blocks = await knex('blocks')
    .where('block_timestamp', '>', start)
    .count()
    .first();

  if (!blocks?.count) return 0;

  return Number((60 / +blocks.count).toFixed(4));
};

const blockData = async () => {
  const latestBlock = await knex('blocks')
    .orderBy('block_height', 'desc')
    .first('block_height', 'total_supply', 'gas_price', 'block_timestamp');

  if (!latestBlock) {
    throw Error('No blocks');
  }

  const avgBlockTime = await blockTime(latestBlock.block_timestamp);

  return {
    avg_block_time: avgBlockTime,
    block: latestBlock.block_height,
    gas_price: latestBlock.gas_price,
    total_supply: latestBlock.total_supply,
  };
};

const marketData = async () => {
  const price = await axios.get(
    'https://api.coingecko.com/api/v3/coins/near?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false',
    { timeout: 10000 },
  );

  return {
    change_24: Number(price.data.market_data.price_change_percentage_24h || 0),
    high_24h: Number(price.data.market_data.high_24h.usd || 0),
    high_all: Number(price.data.market_data.ath.usd || 0),
    low_24h: Number(price.data.market_data.low_24h.usd || 0),
    low_all: Number(price.data.market_data.atl.usd || 0),
    market_cap: Number(price.data.market_data.market_cap.usd || 0),
    near_btc_price: Number(price.data.market_data.current_price.btc || 0),
    near_price: Number(price.data.market_data.current_price.usd || 0),
    volume: Number(price.data.market_data.total_volume.usd || 0),
  };
};

const networkData = async () => {
  const network = await validators();

  return {
    nodes_online: network,
  };
};

const transactionData = async () => {
  const txns = await knex('transactions')
    .count('block_timestamp')
    .where('block_timestamp', '>', 0)
    .first();

  return {
    total_txns: Number(txns?.count || 0),
  };
};

export const syncStats = async () => {
  const block = await blockData();
  const price = await marketData();
  const network = await networkData();
  const txn = await transactionData();
  const data = { ...block, ...price, ...network, ...txn };

  const stats = await knex('stats').first();

  if (stats) {
    return await knex('stats').update(data);
  }

  return await knex('stats').insert(data);
};
