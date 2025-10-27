import Big from 'big.js';
import { Dayjs } from 'dayjs';

import { Network } from 'nb-types';
import { msToNsTime, nsToMsTime, sleep, yoctoToNear } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import { dbBase, dbContracts } from '#libs/knex';
// import { syncNearSupply } from '#services/contracts/lockups';

export const syncStats = async () => {
  let start = dayjs.utc(config.genesisDate);
  const [latestBlock, latestStat] = await Promise.all([
    dbBase.table('blocks').orderBy('block_timestamp', 'desc').first(),
    dbBase.table('daily_stats').orderBy('date', 'desc').first(),
  ]);

  if (!latestBlock || dayjs.utc().isSameOrBefore(start, 'day')) return;

  const end = dayjs
    .utc(nsToMsTime(latestBlock.block_timestamp))
    .startOf('day')
    .subtract(1, 'day');

  if (latestStat) {
    start = dayjs.utc(nsToMsTime(latestStat.date)).add(1, 'day');
  }

  let diff = end.diff(start, 'day');
  diff = diff < 20 ? diff + 1 : 20;

  if (diff < 1) return;

  const days = Array.from({ length: diff }, (_, index) => index);

  for (const day of days) {
    const date = start.clone().add(day, 'day');

    await dayStats(date);
    await sleep(100000);
  }
};

const dayStats = async (day: Dayjs) => {
  const start = msToNsTime(day.clone().startOf('day').valueOf());
  const end = msToNsTime(day.clone().add(1, 'day').startOf('day').valueOf());

  const price = await marketData(day.clone());
  const [block, address, txn] = await Promise.all([
    blockData(start),
    addressData(start, end),
    txnData(start, price.near_price || '0'),
  ]);

  const data = {
    date: start,
    ...price,
    ...block,
    ...address,
    ...txn,
  };

  await dbBase('daily_stats').insert(data);
};

const marketData = async (date: Dayjs) => {
  if (config.network === Network.TESTNET) {
    return {
      market_cap: null,
      near_btc_price: null,
      near_price: null,
    };
  }

  const start = date.format('DD-MM-YYYY');
  const history = await cg.history(start);

  if (!history) {
    throw Error('market request failed');
  }

  return {
    market_cap: history.market_cap,
    near_btc_price: history.price_btc,
    near_price: history.price,
  };
};

const blockData = async (start: string) => {
  const [block, chunk] = await Promise.all([
    dbBase('block_stats').where('date', start).first(),
    dbBase('chunk_stats').where('date', start).first(),
  ]);

  if (!block || !chunk) throw Error('Missing block data!');

  let circulatingSupply = null;

  // All Genesis-locked tokens were fully released by October 10, 2025
  const RELEASE_DATE = Big('1760054400000000000');

  if (config.network === Network.MAINNET) {
    if (Big(start).lt(RELEASE_DATE)) {
      circulatingSupply = block.total_supply;
    } else {
      // TODO update circulating supply calculations and resync historical data
      // syncNearSupply()
    }
  }

  const gasFee = Big(chunk.gas_used).mul(Big(block.gas_price)).toFixed();

  return {
    blocks: block.blocks,
    chunks: chunk.chunks,
    circulating_supply: circulatingSupply,
    gas_fee: gasFee,
    gas_used: chunk.gas_used,
    shards: chunk.shards,
    total_supply: block.total_supply,
  };
};

const addressData = async (start: string, end: string) => {
  const [account, contract] = await Promise.all([
    dbBase('accounts')
      .where('created_by_block_timestamp', '>=', start)
      .where('created_by_block_timestamp', '<', end)
      .count()
      .first(),
    dbContracts('contract_stats').where('date', start).first(),
  ]);

  return {
    new_accounts: account ? String(account.count) : '0',
    new_contracts: contract?.contracts || '0',
  };
};

const txnData = async (start: string, price: string) => {
  const [action, txn, outcome, receipt] = await Promise.all([
    dbBase('action_stats').where('date', start).first(),
    dbBase('transaction_stats').where('date', start).first(),
    dbBase('outcome_stats').where('date', start).first(),
    dbBase('receipt_stats').where('date', start).first(),
  ]);

  if (!action || !txn || !outcome || !receipt) throw Error('Missing txn data!');

  const txnVolume = yoctoToNear(action.deposit);
  const txnVolumeUsd = Big(txnVolume).mul(price).toFixed();
  const txnFee = yoctoToNear(
    Big(txn.tokens_burnt).add(outcome.tokens_burnt).toFixed(),
  );
  const txnFeeUsd = Big(txnFee).mul(price).toFixed();

  return {
    active_accounts: action.accounts,
    active_contracts: action.contracts,
    active_meta_accounts: action.meta_accounts,
    active_meta_relayers: action.meta_relayers,
    meta_txns: action.meta_txns,
    receipts: receipt.receipts,
    txn_fee: txnFee,
    txn_fee_usd: txnFeeUsd,
    txn_volume: txnVolume,
    txn_volume_usd: txnVolumeUsd,
    txns: txn.txns,
  };
};
