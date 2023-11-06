import coinGecko from '#libs/coinGecko';
import coinMarketCap from '#libs/coinMarketCap';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import liveCoinWatch from '#libs/liveCoinWatch';
import { FtMeta } from '#types/types';

export const getTokens = async () => {
  return knex('ft_meta')
    .whereNull('coingecko_id')
    .whereNull('coinmarketcap_id')
    .whereNull('livecoinwatch_id')
    .whereNull('searched_at')
    .orderBy('updated_at', 'asc')
    .limit(2);
};

export const getSearchedTokens = async () => {
  return knex('ft_meta')
    .where(function () {
      this.whereNull('searched_at').orWhere(
        'searched_at',
        '<',
        dayjs.utc().subtract(7, 'days').toISOString(),
      );
    })
    .where(function () {
      this.whereNull('coingecko_id')
        .orWhereNull('coinmarketcap_id')
        .orWhereNull('livecoinwatch_id');
    })
    .orderBy('searched_at', 'asc')
    .limit(1);
};

export const searchContract = async (ftMeta: FtMeta) => {
  if (ftMeta.contract === 'aurora') {
    return await knex('ft_meta').where('contract', ftMeta.contract).update({
      coingecko_id: 'ethereum',
    });
  }

  const [cmcId, coinGeckoId, liveCoinWatchId] = await Promise.all([
    coinMarketCap.marketSearch(ftMeta.contract),
    coinGecko.marketSearch(ftMeta.contract),
    liveCoinWatch.marketSearch(ftMeta.contract),
  ]);

  if (cmcId || coinGeckoId || liveCoinWatchId) {
    const marketId = {
      ...(cmcId && { coinmarketcap_id: cmcId }),
      ...(coinGeckoId && { coingecko_id: coinGeckoId }),
      ...(liveCoinWatchId && { livecoinwatch_id: liveCoinWatchId }),
      searched_at: dayjs.utc().toISOString(),
      updated_at: dayjs.utc().toISOString(),
    };

    return await knex('ft_meta')
      .where('contract', ftMeta.contract)
      .update(marketId);
  }

  return await knex('ft_meta').where('contract', ftMeta.contract).update({
    searched_at: dayjs.utc().toISOString(),
    updated_at: dayjs.utc().toISOString(),
  });
};

export const searchContractList = async () => {
  const coinList = await coinGecko.coinList();

  if (!coinList.length) return;

  const contracts = coinList.map((coin) => coin.contract);

  const tokens = await knex('ft_meta')
    .whereIn('contract', contracts)
    .whereNull('coingecko_id');

  for await (const token of tokens) {
    const coin = coinList.find((coin) => coin.contract === token.contract);

    if (coin) {
      await knex('ft_meta')
        .where('contract', coin.contract)
        .update({ coingecko_id: coin.id });
    }
  }
};
