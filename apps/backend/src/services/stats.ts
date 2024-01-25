import { Big } from 'big.js';

import { logger } from 'nb-logger';
import { msToNsTime } from 'nb-utils';

import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import lcw from '#libs/lcw';
import near from '#libs/near';

const blockTime = async (timestamp: string) => {
  const start = Big(timestamp)
    .minus(Big(msToNsTime(60000)))
    .toFixed();

  const blocks = await knex('blocks')
    .where('block_timestamp', '>', start)
    .count()
    .first();

  if (!blocks?.count) return;

  return Big(60 / +blocks.count).toFixed(4);
};

const blockData = async () => {
  const block = await knex('blocks')
    .orderBy('block_height', 'desc')
    .first('block_height', 'total_supply', 'gas_price', 'block_timestamp');

  if (!block) {
    return {};
  }

  const [avgTime, stats] = await Promise.all([
    blockTime(block.block_timestamp),
    knex('daily_stats').orderBy('date', 'desc').first(),
  ]);

  return {
    avg_block_time: avgTime,
    circulating_supply: stats?.circulating_supply ?? '0',
    gas_price: block.gas_price,
    total_supply: block.total_supply,
  };
};

const marketData = async () => {
  const price = await lcw.marketData('NEAR', true);

  if (!price) return {};

  return {
    change_24: price.change_24,
    high_24h: price.high_24h,
    high_all: price.high_all,
    low_24h: price.low_24h,
    low_all: price.low_all,
    market_cap: price.market_cap,
    near_btc_price: price.price_btc,
    near_price: price.price,
    volume: price.volume_24h,
  };
};

const networkData = async () => {
  let validators = null;

  try {
    validators = await near.query([null], 'validators');
  } catch (error) {
    logger.error({ error });
  }

  return {
    nodes_online: validators?.data?.result?.current_validators?.length ?? 0,
  };
};

export const txnData = async () => {
  const start = dayjs.utc().startOf('day').valueOf();

  const [stats, txns] = await Promise.all([
    knex('daily_stats').sum('txns').first(),
    knex('transactions')
      .count('block_timestamp')
      .where('block_timestamp', '>', msToNsTime(start))
      .first(),
  ]);

  return {
    total_txns: Big(stats?.sum ?? 0)
      .add(txns?.count ?? 0)
      .toString(),
  };
};

export const syncStats = async () => {
  const [block, price, network, txn, stats] = await Promise.all([
    blockData(),
    marketData(),
    networkData(),
    txnData(),
    knex('stats').first(),
  ]);

  const data = { ...block, ...price, ...network, ...txn };

  if (stats) {
    return await knex('stats').update(data);
  }

  return await knex('stats').insert(data);
};
