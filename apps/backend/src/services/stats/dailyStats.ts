import { Dayjs } from 'dayjs';

import { Network } from 'nb-types';
import { msToNsTime, nsToMsTime, sleep } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import { dbBase } from '#libs/knex';

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
    await sleep(1000);
  }
};

const dayStats = async (day: Dayjs) => {
  const start = msToNsTime(day.clone().startOf('day').valueOf());
  const end = msToNsTime(day.clone().add(1, 'day').startOf('day').valueOf());

  const [price, newAccounts] = await Promise.all([
    marketData(day.clone()),
    newAccountsData(start, end),
  ]);

  const data = {
    date: start,
    new_accounts: newAccounts,
    ...price,
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

const newAccountsData = async (start: string, end: string): Promise<string> => {
  const account = await dbBase('accounts')
    .where('created_by_block_timestamp', '>=', start)
    .where('created_by_block_timestamp', '<', end)
    .count()
    .first();

  return account ? String(account.count) : '0';
};
