import { isNull, omitBy } from 'es-toolkit';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import cmc from '#libs/cmc';
import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
import ref from '#libs/ref';
import { MetaContract, Raw } from '#types/types';

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 60_000;
const CMC_BATCH_SIZE = 100;

export const syncFTData = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const { rows: fts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        ft_meta
      WHERE
        searched_at IS NULL
        OR searched_at < ?
      LIMIT
        10
    `,
    [dayjs.utc().subtract(7, 'days').toISOString()],
  );

  await Promise.all(fts.map((ft) => updateFTData(ft.contract)));
};

export const syncFTPrice = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const { rows: fts } = await dbEvents.raw<
    Raw<{ coinmarketcap_id: null | string; contract: string }>
  >(
    `
      SELECT
        contract,
        coinmarketcap_id
      FROM
        ft_meta
    `,
  );

  if (!fts.length) {
    return;
  }

  const contracts = new Set(fts.map((ft) => ft.contract));
  const prices = new Map<string, string>();

  const cgContracts = await cg.coins();
  const cgTokens = (cgContracts ?? []).filter((contract) =>
    contracts.has(contract),
  );

  for (let i = 0; i < cgTokens.length; i += BATCH_SIZE) {
    if (i > 0) {
      await sleep(BATCH_DELAY_MS);
    }

    const batch = cgTokens.slice(i, i + BATCH_SIZE);
    const data = await cg.prices(batch);

    if (!data) {
      continue;
    }

    for (const contract of batch) {
      const usd = data[contract]?.usd;

      if (usd != null) {
        prices.set(contract, String(usd));
      }
    }
  }

  const cmcIds = new Map<string, string[]>();

  for (const ft of fts) {
    if (ft.coinmarketcap_id && !prices.has(ft.contract)) {
      cmcIds.set(ft.coinmarketcap_id, [
        ...(cmcIds.get(ft.coinmarketcap_id) ?? []),
        ft.contract,
      ]);
    }
  }

  const ids = [...cmcIds.keys()];

  for (let i = 0; i < ids.length; i += CMC_BATCH_SIZE) {
    const batch = ids.slice(i, i + CMC_BATCH_SIZE);
    const data = await cmc.quotes(batch);

    if (!data) {
      continue;
    }

    for (const id of batch) {
      const price = data[id];

      if (price != null) {
        for (const contract of cmcIds.get(id) ?? []) {
          prices.set(contract, String(price));
        }
      }
    }
  }

  const [whitelist, refData] = await Promise.all([
    ref.whitelist(),
    ref.price(),
  ]);

  if (whitelist?.length && refData) {
    const whitelistSet = new Set(whitelist);

    for (const contract of Object.keys(refData)) {
      if (
        contracts.has(contract) &&
        whitelistSet.has(contract) &&
        !prices.has(contract)
      ) {
        prices.set(contract, refData[contract].price);
      }
    }
  }

  const keys = [...prices.keys()];

  if (!keys.length) {
    return;
  }

  const values = keys.map(() => `(?, ?)`).join(',');
  const bindings = keys.flatMap((key) => [key, prices.get(key)]);

  await dbEvents.raw(
    `
      UPDATE ft_meta AS t
      SET
        price = v.price::numeric,
        refreshed_at = now()
      FROM
        (
          VALUES
            ${values}
        ) AS v (contract, price)
      WHERE
        t.contract = v.contract
    `,
    bindings,
  );
};

const updateFTData = async (contract: string) => {
  try {
    const [cmcData, cgData] = await Promise.all([
      cmc.search(contract),
      cg.search(contract),
    ]);

    const data = {
      ...omitBy(cmcData || {}, isNull),
      ...omitBy(cgData || {}, isNull),
      searched_at: dayjs.utc().toISOString(),
    };

    await dbEvents('ft_meta').where('contract', contract).update(data);
  } catch (error) {
    logger.error(`tokenMarket: updateFTData: ${contract}`);
    logger.error(error);
  }
};
