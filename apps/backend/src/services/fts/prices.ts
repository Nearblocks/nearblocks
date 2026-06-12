import { logger } from 'nb-logger';
import { FTPrice, Network } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
import ref from '#libs/ref';
import { MetaContract, Raw } from '#types/types';

const BATCH_SIZE = 125;
const BATCH_DELAY_MS = 60_000;
const UPSERT_CHUNK_SIZE = 1000;

export const syncFTPrices = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const { rows: fts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        ft_meta
    `,
  );

  if (!fts.length) {
    return;
  }

  const contracts = new Set(fts.map((ft) => ft.contract));
  const date = String(dayjs.utc().startOf('day').valueOf());
  const prices = new Map<string, FTPrice>();

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
        prices.set(contract, {
          contract,
          date,
          price: String(usd),
          source: 'coingecko',
        });
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
        prices.set(contract, {
          contract,
          date,
          price: refData[contract].price,
          source: 'ref',
        });
      }
    }
  }

  const rows = [...prices.values()];

  if (!rows.length) {
    return;
  }

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    await dbEvents('ft_prices')
      .insert(rows.slice(i, i + UPSERT_CHUNK_SIZE))
      .onConflict(['contract', 'date'])
      .merge();
  }

  logger.info(`tokenPrices: updated ${rows.length} prices`);
};
