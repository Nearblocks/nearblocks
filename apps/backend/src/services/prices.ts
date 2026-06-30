import { logger } from 'nb-logger';
import { Network, PriceHistory } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
import { syncMTTokens } from '#services/mts/market';
import { Raw } from '#types/types';

const ID_BATCH_SIZE = 250;
const BATCH_DELAY_MS = 60_000;
const UPSERT_CHUNK_SIZE = 1000;
const BACKFILL_COIN_LIMIT = 500;
const BACKFILL_DELAY_MS = 2_000;

const coingeckoIds = async (): Promise<string[]> => {
  const { rows } = await dbEvents.raw<Raw<{ coingecko_id: string }>>(
    `
      SELECT
        coingecko_id
      FROM
        ft_meta
      WHERE
        coingecko_id IS NOT NULL
      UNION
      SELECT
        coingecko_id
      FROM
        mt_intents_tokens
      WHERE
        coingecko_id IS NOT NULL
    `,
  );

  return rows.map((row) => row.coingecko_id);
};

const fetchPrices = async (ids: string[]): Promise<Map<string, number>> => {
  const prices = new Map<string, number>();

  for (let i = 0; i < ids.length; i += ID_BATCH_SIZE) {
    if (i > 0) {
      await sleep(BATCH_DELAY_MS);
    }

    const batch = ids.slice(i, i + ID_BATCH_SIZE);
    const data = await cg.ids(batch);

    if (!data) {
      continue;
    }

    for (const id of batch) {
      const usd = data[id]?.usd;

      if (usd != null) {
        prices.set(id, usd);
      }
    }
  }

  return prices;
};

export const syncPrices = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  await syncMTTokens();

  const ids = await coingeckoIds();

  if (!ids.length) {
    return;
  }

  const priced = await fetchPrices(ids);
  const entries = [...priced.entries()];

  if (!entries.length) {
    return;
  }

  const date = String(dayjs.utc().valueOf());
  const rows: PriceHistory[] = entries.map(([id, usd]) => ({
    coingecko_id: id,
    date,
    price: String(usd),
    source: 'coingecko',
  }));

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    await dbEvents('ft_prices')
      .insert(rows.slice(i, i + UPSERT_CHUNK_SIZE))
      .onConflict(['coingecko_id', 'date'])
      .merge();
  }

  logger.info(`tokenPrice: updated ${rows.length} prices`);
};

export const syncPriceHistory = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const ids = await coingeckoIds();

  if (!ids.length) {
    return;
  }

  const { rows: synced } = await dbEvents.raw<
    Raw<{ coingecko_id: string; max: string }>
  >(
    `
      SELECT
        coingecko_id,
        max(date) AS max
      FROM
        ft_prices_daily
      GROUP BY
        coingecko_id
    `,
  );

  const lastById = new Map(
    synced.map((row) => [row.coingecko_id, Number(row.max)]),
  );
  const genesis = dayjs.utc(config.genesisDate).startOf('day');
  const yesterday = dayjs.utc().startOf('day').subtract(1, 'day');

  const pending = ids
    .map((id) => ({
      from: lastById.has(id)
        ? dayjs.utc(lastById.get(id)!).add(1, 'day')
        : genesis,
      id,
    }))
    .filter((coin) => coin.from.isSameOrBefore(yesterday, 'day'))
    .sort((a, b) => a.from.valueOf() - b.from.valueOf())
    .slice(0, BACKFILL_COIN_LIMIT);

  const to = Math.floor(yesterday.endOf('day').valueOf() / 1000);
  let count = 0;

  for (const coin of pending) {
    const from = Math.floor(coin.from.valueOf() / 1000);
    const chart = await cg.marketChart(coin.id, from, to);
    await sleep(BACKFILL_DELAY_MS);

    if (!chart || !chart.length) {
      continue;
    }

    const byDay = new Map<number, number>();

    for (const [ms, usd] of chart) {
      byDay.set(dayjs.utc(ms).startOf('day').valueOf(), usd);
    }

    const rows: PriceHistory[] = [...byDay.entries()].map(([day, usd]) => ({
      coingecko_id: coin.id,
      date: String(day),
      price: String(usd),
      source: 'coingecko',
    }));

    for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
      await dbEvents('ft_prices_daily')
        .insert(rows.slice(i, i + UPSERT_CHUNK_SIZE))
        .onConflict(['coingecko_id', 'date'])
        .merge();
    }

    count++;
  }

  logger.info(`tokenPriceDaily: backfilled ${count} coins`);
};
