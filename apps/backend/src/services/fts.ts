import isNull from 'lodash/isNull.js';
import omitBy from 'lodash/omitBy.js';

import { FTMeta, Network } from 'nb-types';

import config from '#config';
import cg from '#libs/cg';
import cmc from '#libs/cmc';
import { upsertErrorContract } from '#libs/contract';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
// import lcw from '#libs/lcw';
import { ftMeta, ftTotalSupply } from '#libs/near';
import ref from '#libs/ref';
import { tokenAmount } from '#libs/utils';

type RawResp = {
  rows: ContractResp[];
};

type ContractResp = {
  contract: string;
};

export const syncTokens = async () => {
  const tokens = await knex.raw<RawResp>(
    `
      SELECT
        contract_account_id AS contract
      FROM
        (
          SELECT
            contract_account_id
          FROM
            (
              SELECT DISTINCT
                contract_account_id
              FROM
                ft_events
            ) ft
          WHERE
            NOT EXISTS (
              SELECT
                1
              FROM
                errored_contracts ec
              WHERE
                ft.contract_account_id = ec.contract
                AND type = 'ft'
                AND attempts >= 5
            )
        ) AS ft
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            ft_meta
          WHERE
            ft.contract_account_id = ft_meta.contract
        )
      LIMIT
        10;
    `,
  );

  await Promise.all(tokens?.rows.map((token) => updateMeta(token.contract)));
};

export const refreshMeta = async () => {
  const tokens = await knex.raw<RawResp>(
    `
        SELECT
          contract
        FROM
          (
            SELECT
              contract
            FROM
              (
                SELECT DISTINCT
                  contract,
                  refreshed_at
                FROM
                  ft_meta
              ) ft
            WHERE
              refreshed_at < ?
              AND NOT EXISTS (
                SELECT
                  1
                FROM
                  errored_contracts ec
                WHERE
                  ft.contract = ec.contract
                  AND ec.type = 'ft'
                  AND ec.attempts >= 5
              )
            ORDER BY
              refreshed_at ASC NULLS FIRST
          ) AS ft
        LIMIT
          10;
    `,
    [dayjs.utc().subtract(7, 'days').toISOString()],
  );

  await Promise.all(tokens?.rows.map((token) => updateMeta(token.contract)));
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
  if (config.network === Network.TESTNET) {
    return;
  }

  const tokens = await knex('ft_meta')
    .where(function () {
      this.whereNotNull('coinmarketcap_id').orWhereNotNull('coingecko_id');
      // .orWhereNotNull('livecoinwatch_id');
    })
    .where('updated_at', '<', dayjs.utc().subtract(5, 'minutes').toISOString())
    .orderBy('updated_at', 'asc')
    .limit(5);

  await Promise.all(tokens.map((token) => updateMarketData(token)));
};

export const updateMarketData = async (meta: FTMeta) => {
  try {
    const [refData, cmcData, cgData] = await Promise.all([
      ref.marketData(meta.contract),
      // meta.livecoinwatch_id ? lcw.marketData(meta.livecoinwatch_id) : null,
      meta.coinmarketcap_id ? cmc.marketData(meta.coinmarketcap_id) : null,
      meta.coingecko_id ? cg.marketData(meta.coingecko_id) : null,
    ]);

    const marketData = {
      ...omitBy(refData, isNull),
      // ...omitBy(lcwData, isNull),
      ...omitBy(cmcData, isNull),
      ...omitBy(cgData, isNull),
      updated_at: dayjs.utc().toISOString(),
    };

    await knex('ft_meta').where('contract', meta.contract).update(marketData);
  } catch (error) {
    //
  }
};

export const searchContracts = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const [unsearched, searched] = await Promise.all([
    knex('ft_meta')
      .whereNull('coingecko_id')
      .whereNull('coinmarketcap_id')
      // .whereNull('livecoinwatch_id')
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
    const [cmcId, cgId] = await Promise.all([
      // lcw.marketSearch(meta.contract),
      cmc.marketSearch(meta.contract),
      cg.marketSearch(meta.contract),
    ]);

    const marketData = {
      // ...(lcwId && { livecoinwatch_id: lcwId }),
      ...(cmcId && { coinmarketcap_id: cmcId }),
      ...(cgId && { coingecko_id: cgId }),
      searched_at: dayjs.utc().toISOString(),
      updated_at: dayjs.utc().toISOString(),
    };

    await knex('ft_meta').where('contract', meta.contract).update(marketData);
  } catch (error) {
    //
  }
};
