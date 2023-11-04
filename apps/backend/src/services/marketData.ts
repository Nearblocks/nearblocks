import isNull from 'lodash/isNull.js';
import omitBy from 'lodash/omitBy.js';

import coinGecko from '#libs/coinGecko';
import coinMarketCap from '#libs/coinMarketCap';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import liveCoinWatch from '#libs/liveCoinWatch';
import { FtMarketData, FtMeta } from '#types/types';

export const getTokens = async () => {
  return knex('ft_meta')
    .where(function () {
      this.whereNotNull('coingecko_id')
        .orWhereNotNull('coinmarketcap_id')
        .orWhereNotNull('livecoinwatch_id');
    })
    .where(function () {
      this.whereNull('updated_at').orWhere(
        'updated_at',
        '<',
        dayjs.utc().subtract(5, 'minutes').toISOString(),
      );
    })
    .orderBy('updated_at', 'asc')
    .limit(5);
};

export const syncMarketData = async (ftMeta: FtMeta) => {
  let coinMarketData: FtMarketData | null = null;
  let coinGeckoData: FtMarketData | null = null;
  let liveCoinWatchData: FtMarketData | null = null;

  if (ftMeta.coinmarketcap_id) {
    coinMarketData = await coinMarketCap.marketData(ftMeta.coinmarketcap_id);
  }

  if (ftMeta.coingecko_id) {
    coinGeckoData = await coinGecko.marketData(ftMeta.coingecko_id);
  }

  if (ftMeta.livecoinwatch_id) {
    liveCoinWatchData = await liveCoinWatch.marketData(ftMeta.livecoinwatch_id);
  }

  const marketData = {
    ...omitBy(coinMarketData, isNull),
    ...omitBy(coinGeckoData, isNull),
    ...omitBy(liveCoinWatchData, isNull),
  };

  await knex('ft_meta')
    .where('contract', ftMeta.contract)
    .update({ ...(marketData || {}), updated_at: dayjs.utc().toISOString() });
};
