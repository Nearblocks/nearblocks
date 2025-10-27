import { Big } from 'big.js';

import { Network } from 'nb-types';
import { msToNsTime } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import { dbBase } from '#libs/knex';
import { fetchValidators } from '#libs/near';
import { Raw } from '#types/types.js';

export const syncStats = async () => {
  const block = await blockData();
  const stats = await dbBase('stats').first();
  const [price, network, txn] = await Promise.all([
    marketData(),
    networkData(),
    txnData(),
  ]);

  const data = { ...block, ...price, ...network, ...txn };

  if (stats) {
    await dbBase('stats').update(data);

    return;
  }

  await dbBase('stats').insert(data);
};

const blockData = async () => {
  const block = await dbBase('blocks').orderBy('block_height', 'desc').first();

  if (!block) return {};

  const avgTime = await blockTime(block.block_timestamp);
  const circulatingSupply = block.total_supply; // All Genesis-locked tokens were fully released by October 10, 2025

  if (!avgTime) {
    return {
      circulating_supply: circulatingSupply,
      gas_price: block.gas_price,
      total_supply: block.total_supply,
    };
  }

  return {
    avg_block_time: avgTime,
    circulating_supply: circulatingSupply,
    gas_price: block.gas_price,
    total_supply: block.total_supply,
  };
};

const blockTime = async (timestamp: string) => {
  const start = Big(timestamp)
    .minus(Big(msToNsTime(60000)))
    .toFixed();

  const { rows } = await dbBase.raw<Raw<{ count: number }>>(
    `
      SELECT
        COUNT(*) as count
      FROM
        blocks
      WHERE
        block_timestamp >= ?
        AND block_timestamp <= ?
    `,
    [start, timestamp],
  );

  if (!rows[0].count) return;

  return Big(60 / +rows[0].count).toFixed(4);
};

const marketData = async () => {
  if (config.network === Network.TESTNET) {
    return {};
  }

  const price = await cg.price('near');

  if (!price) return {};

  return {
    change_24h: price.change_24h,
    market_cap: price.market_cap,
    near_btc_price: price.price_btc,
    near_price: price.price,
    volume_24h: price.volume_24h,
  };
};

const networkData = async () => {
  const validators = await fetchValidators();

  if (!validators) return {};

  return {
    nodes_online: validators.currentValidators.length,
  };
};

export const txnData = async () => {
  const [{ rows: stats }, { rows: tps }] = await Promise.all([
    dbBase.raw(
      `
        SELECT
          SUM(txns) AS txns
        FROM
          transaction_stats
      `,
    ),
    dbBase.raw(
      `
        SELECT
          ROUND(SUM(txns) / 60) AS tps
        FROM
          tps_stats
        WHERE
          date = (
            SELECT
              MAX(date)
            FROM
              tps_stats
          )
        GROUP BY
          date
      `,
    ),
  ]);

  return {
    total_txns: stats?.[0]?.txns || 0,
    tps: tps?.[0]?.tps || 0,
  };
};
