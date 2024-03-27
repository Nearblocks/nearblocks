import { Big } from 'big.js';

import { msToNsTime } from 'nb-utils';

import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import lcw from '#libs/lcw';
import near from '#libs/near';

const blockTime = async (timestamp: string) => {
  try {
    const start = Big(timestamp)
      .minus(Big(msToNsTime(60000)))
      .toFixed();

    console.log({ job: 'stats', start, timestamp });

    const blocks = await knex('blocks')
      .where('block_timestamp', '>', start)
      .count()
      .first();

    if (!blocks?.count) return;

    return Big(60 / +blocks.count).toFixed(4);
  } catch (error) {
    console.log({ error, job: 'stats' });
    return null;
  }
};

const blockData = async () => {
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  if (!block) {
    return {};
  }

  const avgTime = await blockTime(block.block_timestamp);

  if (!avgTime) {
    return {
      gas_price: block.gas_price,
      total_supply: block.total_supply,
    };
  }

  return {
    avg_block_time: avgTime,
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
    console.log({ error });
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
      .toFixed(),
  };
};

export const syncStats = async () => {
  try {
    const block = await blockData();
    const stats = await knex('stats').first();
    const [price, network, txn] = await Promise.all([
      marketData(),
      networkData(),
      txnData(),
    ]);

    const data = { ...block, ...price, ...network, ...txn };

    if (stats) {
      return await knex('stats').update(data);
    }

    return await knex('stats').insert(data);
  } catch (error) {
    return console.log({ error, job: 'stats' });
  }
};
