import { Big } from 'big.js';

import { Network } from 'nb-types';
import { msToNsTime } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import knex from '#libs/knex';
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
  if (config.network === Network.TESTNET) {
    return {};
  }

  const price = await cg.marketData('near', true);

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
  try {
    const validators = await near.query([null], 'validators');

    return {
      nodes_online: validators?.data?.result?.current_validators?.length ?? 0,
    };
  } catch (error) {
    console.log({ error });
  }

  return {};
};

export const txnData = async () => {
  const [stats, tps] = await Promise.all([
    knex
      .select(
        knex.raw(
          "count_estimate('SELECT transaction_hash FROM transactions') as count",
        ),
      )
      .first(),
    knex('tps').orderBy('date', 'desc').first(),
  ]);

  return {
    total_txns: stats?.count ?? 0,
    tps: tps?.txns ?? 0,
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
