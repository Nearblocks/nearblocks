import isNull from 'lodash/isNull.js';
import omitBy from 'lodash/omitBy.js';

import { FTMeta } from 'nb-types';

// import cg from '#libs/cg';
import cmc from '#libs/cmc';
import { upsertErrorContract } from '#libs/contract';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import lcw from '#libs/lcw';
import { ftMeta, ftTotalSupply } from '#libs/near';
import { tokenAmount } from '#libs/utils';

export const syncTokens = async () => {
  const tokens = await knex
    .select('contract_account_id')
    .from(
      knex
        .select('contract_account_id')
        .fromRaw('ft_events ft')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('errored_contracts ec')
            .whereRaw('ft.contract_account_id = ec.contract')
            .where('type', 'ft')
            .where('attempts', '>=', 5),
        )
        .groupBy('contract_account_id')
        .as('ft'),
    )
    .whereNotExists(
      knex
        .select('*')
        .from('ft_meta')
        .whereRaw('ft.contract_account_id = ft_meta.contract'),
    )
    .limit(10);

  await Promise.all(
    tokens.map((token) => updateMeta(token.contract_account_id)),
  );
};

export const refreshMeta = async () => {
  const tokens = await knex
    .select('contract')
    .from(
      knex
        .select('contract')
        .fromRaw('ft_meta ft')
        .where(
          'refreshed_at',
          '<',
          dayjs.utc().subtract(7, 'days').toISOString(),
        )
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('errored_contracts ec')
            .whereRaw('ft.contract = ec.contract')
            .where('type', 'ft')
            .where('attempts', '>=', 5),
        )
        .groupBy('contract')
        .orderByRaw('refreshed_at ASC NULLS FIRST')
        .as('ft'),
    )
    .limit(10);

  await Promise.all(tokens.map((token) => updateMeta(token.contract)));
};

const updateMeta = async (contract: string) => {
  try {
    const meta = await ftMeta(contract);

    if (meta?.name && meta?.symbol) {
      return knex('ft_meta')
        .insert({
          contract,
          decimals: meta.decimals,
          icon: meta.icon,
          name: meta.name,
          reference: meta.reference,
          reference_hash: meta.reference_hash,
          refreshed_at: dayjs.utc().toISOString(),
          spec: meta.spec,
          symbol: meta.symbol,
          updated_at: dayjs.utc().toISOString(),
        })
        .onConflict('contract')
        .ignore();
    }
  } catch (error) {
    //
  }

  return upsertErrorContract(contract, 'ft', null);
};

export const syncTotalSupply = async () => {
  const tokens = await knex('ft_meta')
    .orderByRaw('synced_at ASC NULLS FIRST')
    .limit(5);

  await Promise.all(tokens.map((token) => updateTotalSupply(token)));
};

export const updateTotalSupply = async (meta: FTMeta) => {
  try {
    const data = await ftTotalSupply(meta.contract);

    if (data) {
      const totalSupply = tokenAmount(data, meta.decimals);

      return knex('ft_meta').where('contract', meta.contract).update({
        synced_at: dayjs.utc().toISOString(),
        total_supply: totalSupply,
      });
    }
  } catch (error) {
    //
  }

  return knex('ft_meta').where('contract', meta.contract).update({
    synced_at: dayjs.utc().toISOString(),
  });
};

export const syncMarketData = async () => {
  const tokens = await knex('ft_meta')
    .where(function () {
      this.whereNotNull('coinmarketcap_id')
        // .orWhereNotNull('coingecko_id')
        .orWhereNotNull('livecoinwatch_id');
    })
    .where('updated_at', '<', dayjs.utc().subtract(5, 'minutes').toISOString())
    .orderBy('updated_at', 'asc')
    .limit(5);

  await Promise.all(tokens.map((token) => updateMarketData(token)));
};

export const updateMarketData = async (meta: FTMeta) => {
  try {
    const [lcwData, cmcData] = await Promise.all([
      meta.livecoinwatch_id ? lcw.marketData(meta.livecoinwatch_id) : null,
      meta.coinmarketcap_id ? cmc.marketData(meta.coinmarketcap_id) : null,
      // meta.coingecko_id ? cg.marketData(meta.coingecko_id) : null,
    ]);

    const marketData = {
      ...omitBy(lcwData, isNull),
      ...omitBy(cmcData, isNull),
      // ...omitBy(cgData, isNull),
      updated_at: dayjs.utc().toISOString(),
    };

    await knex('ft_meta').where('contract', meta.contract).update(marketData);
  } catch (error) {
    //
  }
};

export const searchContracts = async () => {
  const [unsearched, searched] = await Promise.all([
    knex('ft_meta')
      // .whereNull('coingecko_id')
      .whereNull('coinmarketcap_id')
      .whereNull('livecoinwatch_id')
      .orderByRaw('searched_at ASC NULLS FIRST')
      .limit(4),
    knex('ft_meta')
      .where('searched_at', '<', dayjs.utc().subtract(7, 'days').toISOString())
      .orderByRaw('searched_at ASC NULLS FIRST')
      .limit(2),
  ]);

  await Promise.all([
    Promise.all(unsearched.map((meta) => updateMarketSearch(meta))),
    Promise.all(searched.map((meta) => updateMarketSearch(meta))),
  ]);
};

export const updateMarketSearch = async (meta: FTMeta) => {
  try {
    const [lcwId, cmcId] = await Promise.all([
      lcw.marketSearch(meta.contract),
      cmc.marketSearch(meta.contract),
      // cg.marketSearch(meta.contract),
    ]);

    const marketData = {
      ...(lcwId && { livecoinwatch_id: lcwId }),
      ...(cmcId && { coinmarketcap_id: cmcId }),
      // ...(cgId && { coingecko_id: cgId }),
      searched_at: dayjs.utc().toISOString(),
      updated_at: dayjs.utc().toISOString(),
    };

    await knex('ft_meta').where('contract', meta.contract).update(marketData);
  } catch (error) {
    //
  }
};
