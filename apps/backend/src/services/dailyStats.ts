import axios from 'axios';
import { Big } from 'big.js';
import { Dayjs } from 'dayjs';
import PMap from 'p-map';

import config from '#config';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import {
  fiatValue,
  msToNsTime,
  nsToMsTime,
  sleep,
  txnFees,
  yoctoToNear,
} from '#libs/utils';
import { Network } from '#types/enums';

const marketData = async (date: Dayjs) => {
  if (config.network === Network.TESTNET) {
    return {
      market_cap: 0,
      near_price: 0,
    };
  }

  const start = date.format('DD-MM-YYYY');
  const price = await axios.get(
    `https://api.coingecko.com/api/v3/coins/near/history?date=${start}&localization=false`,
    { timeout: 10000 },
  );

  return {
    market_cap: Number(price?.data?.market_data?.market_cap?.usd || 0),
    near_price: Number(price?.data?.market_data?.current_price?.usd || 0),
  };
};

const blockData = async (start: string, end: string) => {
  const blocks = await knex('blocks')
    .whereBetween('block_timestamp', [start, end])
    .count()
    .first();

  const supply = await knex('blocks')
    .whereBetween('block_timestamp', [start, end])
    .orderBy('block_timestamp', 'desc')
    .limit(1)
    .first('total_supply');

  return {
    avg_gas_limit: 0,
    avg_gas_price: '0',
    blocks: Number(blocks?.count || 0),
    gas_fee: '0',
    gas_used: '0',
    total_supply: supply?.total_supply || '0',
  };
};

const txnData = async (start: string, end: string, price: number) => {
  const txns = await knex('transactions')
    .whereBetween('block_timestamp', [start, end])
    .count()
    .first();

  const volume = await knex('action_receipt_actions')
    .whereBetween('receipt_included_in_block_timestamp', [start, end])
    .where('action_kind', 'TRANSFER')
    .sum({ sum: knex.raw("CAST(args->>'deposit' as NUMERIC)") })
    .first();

  const volumeInNear = yoctoToNear(volume?.sum || 0);
  const volumeUSD = fiatValue(volumeInNear, price);

  const tokensBurntByTxn = await knex('transactions')
    .whereBetween('block_timestamp', [start, end])
    .sum('receipt_conversion_tokens_burnt')
    .first();

  const tokensBurntByReceipts = await knex('execution_outcomes')
    .whereBetween('executed_in_block_timestamp', [start, end])
    .sum('tokens_burnt')
    .first();

  const txnFee = txnFees(
    tokensBurntByTxn?.sum || 0,
    tokensBurntByReceipts?.sum || 0,
  );

  const txnFeeInNear = yoctoToNear(txnFee);
  const txnFeeUsd = fiatValue(txnFeeInNear, price);

  return {
    txn_fee: txnFee,
    txn_fee_usd: Number(txnFeeUsd),
    txn_volume: String(volume?.sum || 0),
    txn_volume_usd: Number(volumeUSD),
    txns: Number(txns?.count || 0),
  };
};

const addressData = async (start: string, end: string) => {
  const latest = await knex('daily_stats').orderBy('date', 'desc').first();

  const accounts = await knex('accounts')
    .join('blocks', 'accounts.last_update_block_height', 'blocks.block_height')
    .whereBetween('blocks.block_timestamp', [start, end])
    .count()
    .first();

  const count = Number(accounts?.count || 0);
  const lastTotal = latest?.total_addresses ?? 0;
  const total = Big(lastTotal).add(Big(count)).toFixed();

  return {
    addresses: count,
    total_addresses: Number(total),
  };
};

const dayStats = async (date: string) => {
  const day = dayjs.utc(date);

  if (dayjs.utc().isSameOrBefore(day)) return;

  const start = msToNsTime(day.startOf('day').valueOf());
  const end = msToNsTime(day.endOf('day').valueOf());

  const price = await marketData(day);
  const block = await blockData(start, end);
  const txn = await txnData(start, end, price.near_price);
  const address = await addressData(start, end);

  const data = {
    date: day.format('YYYY-MM-DD'),
    ...price,
    ...block,
    ...txn,
    ...address,
  };

  await knex('daily_stats').insert(data);
};

export const syncStats = async () => {
  let start = dayjs.utc(config.genesisDate);
  const latestBlock = await knex
    .table('blocks')
    .orderBy('block_timestamp', 'desc')
    .first();

  if (!latestBlock || dayjs.utc().isSameOrBefore(start, 'day')) return;

  const end = dayjs
    .utc(nsToMsTime(latestBlock.block_timestamp))
    .startOf('day')
    .subtract(1, 'day');

  const latestStat = await knex
    .table('daily_stats')
    .orderBy('date', 'desc')
    .first();

  if (latestStat) {
    start = dayjs.utc(latestStat.date).add(1, 'day');
  }

  let diff = end.diff(start, 'day');
  diff = diff < 20 ? diff + 1 : 20;

  if (diff < 1) return;

  await PMap(
    [...Array(diff)],
    async (_, i) => {
      const date = start.clone().add(i, 'day');

      await dayStats(date.format('YYYY-MM-DD'));
      await sleep(1000);
    },
    { concurrency: 1 },
  );
};
