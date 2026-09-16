import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { big } from '#libs/utils';

const DAY_MS = 86_400_000n;
const BALANCES_TABLE = 'tvl_balances_daily';
const STATS_TABLE = 'tvl_stats_daily';
const SOLANA_CHAIN = 'solana';
const STATS_REBUILD_DAYS = 3n;
const STATS_CATCHUP_DAYS = 30n;
const PRICE_REPAIR_DAYS = 30n;
const STATS_INTERVAL_MS = 60_000;

const statsKey = (protocol: string, chain: string) =>
  `tvl_stats_${protocol}_${chain}`;

const balanceSyncKey = (protocol: string, chain: string) =>
  `tvl_balances_${protocol}_${chain}`;

export const syncTvlStats = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await stats();
    await sleep(STATS_INTERVAL_MS);
  }
};

const solanaBackfilling = async (protocol: string, chain: string) => {
  if (chain !== SOLANA_CHAIN) return false;

  const pending = await knex('tvl_solana_accounts')
    .where({ chain, protocol, scan_complete: false })
    .first();

  return Boolean(pending);
};

const oldestBalanceDay = async (protocol: string, chain: string) => {
  const first = await knex(BALANCES_TABLE)
    .where({ chain, protocol })
    .min('date as date')
    .first();

  return big(first?.date as string);
};

const dayWindow = async (protocol: string, chain: string) => {
  const balanceSync = await knex('settings')
    .where('key', balanceSyncKey(protocol, chain))
    .first();

  const lastDay = big(balanceSync?.value?.sync as string);

  if (!lastDay) return null;

  const backfilling = await solanaBackfilling(protocol, chain);

  const statsSync = backfilling
    ? undefined
    : await knex('settings').where('key', statsKey(protocol, chain)).first();

  const synced = backfilling ? null : big(statsSync?.value?.sync as string);
  let startDay = synced ? synced - STATS_REBUILD_DAYS * DAY_MS : null;

  if (!startDay) {
    const oldest = await oldestBalanceDay(protocol, chain);

    if (!oldest) return null;

    startDay = oldest;
  }

  if (startDay > lastDay) return null;

  const endDay =
    lastDay - startDay > STATS_CATCHUP_DAYS * DAY_MS
      ? startDay + STATS_CATCHUP_DAYS * DAY_MS
      : lastDay;

  return { endDay, startDay };
};

const statsForSource = async (protocol: string, chain: string) => {
  const window = await dayWindow(protocol, chain);

  if (!window) return;

  const { endDay, startDay } = window;

  logger.info(
    `${STATS_TABLE}: ${protocol}/${chain}: days: ${startDay} - ${endDay}`,
  );

  await knex.transaction(async (trx) => {
    await trx.raw(
      `
        INSERT INTO
          ${STATS_TABLE} (date, protocol, chain, token, amount, price, amount_usd)
        SELECT
          b.date,
          b.protocol,
          b.chain,
          b.token,
          b.amount,
          pr.price,
          b.amount / (10::NUMERIC ^ t.decimals) * pr.price AS amount_usd
        FROM
          ${BALANCES_TABLE} b
          JOIN tvl_tokens t ON t.protocol = b.protocol
          AND t.chain = b.chain
          AND t.token = b.token
          AND t.decimals IS NOT NULL
          LEFT JOIN LATERAL (
            SELECT
              fpd.price
            FROM
              ft_prices_daily fpd
            WHERE
              fpd.coingecko_id = t.coingecko_id
              AND fpd.date = b.date - 86400000 -- previous day's 00:00 snapshot
            ORDER BY
              fpd.date DESC
            LIMIT
              1
          ) pr ON t.coingecko_id IS NOT NULL
        WHERE
          b.protocol = ?
          AND b.chain = ?
          AND b.date >= ?
          AND b.date <= ?
        ON CONFLICT (date, protocol, chain, token) DO UPDATE
        SET
          amount = EXCLUDED.amount,
          price = EXCLUDED.price,
          amount_usd = EXCLUDED.amount_usd
      `,
      [protocol, chain, startDay.toString(), endDay.toString()],
    );

    await trx('settings')
      .insert({
        key: statsKey(protocol, chain),
        value: { sync: endDay.toString() },
      })
      .onConflict('key')
      .merge();
  });
};

const repairPricesForSource = async (protocol: string, chain: string) => {
  await knex.raw(
    `
      WITH stale AS (
        SELECT DISTINCT date
        FROM ${STATS_TABLE}
        WHERE protocol = ? AND chain = ? AND price IS NULL
        ORDER BY date
        LIMIT ?
      )
      INSERT INTO
        ${STATS_TABLE} (date, protocol, chain, token, amount, price, amount_usd)
      SELECT
        b.date,
        b.protocol,
        b.chain,
        b.token,
        b.amount,
        pr.price,
        b.amount / (10::NUMERIC ^ t.decimals) * pr.price AS amount_usd
      FROM
        ${BALANCES_TABLE} b
        JOIN stale ON stale.date = b.date
        JOIN tvl_tokens t ON t.protocol = b.protocol
        AND t.chain = b.chain
        AND t.token = b.token
        AND t.decimals IS NOT NULL
        JOIN LATERAL (
          SELECT
            fpd.price
          FROM
            ft_prices_daily fpd
          WHERE
            fpd.coingecko_id = t.coingecko_id
            AND fpd.date = b.date - 86400000 -- previous day's 00:00 snapshot
          ORDER BY
            fpd.date DESC
          LIMIT
            1
        ) pr ON t.coingecko_id IS NOT NULL
      WHERE
        b.protocol = ?
        AND b.chain = ?
      ON CONFLICT (date, protocol, chain, token) DO UPDATE
      SET
        amount = EXCLUDED.amount,
        price = EXCLUDED.price,
        amount_usd = EXCLUDED.amount_usd
    `,
    [protocol, chain, PRICE_REPAIR_DAYS.toString(), protocol, chain],
  );
};

const stats = async () => {
  try {
    const sources: { chain: string; protocol: string }[] = await knex(
      'tvl_sources',
    ).select('protocol', 'chain');

    logger.info(`${STATS_TABLE}: polling ${sources.length} sources`);

    for (const { chain, protocol } of sources) {
      // eslint-disable-next-line no-await-in-loop
      await statsForSource(protocol, chain);
      // eslint-disable-next-line no-await-in-loop
      await repairPricesForSource(protocol, chain);
    }
  } catch (error) {
    logger.error(error, 'syncTvlStats');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
