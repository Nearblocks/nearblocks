/* eslint-disable no-await-in-loop, no-constant-condition */
import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { db } from '#libs/knex';
import {
  balanceSyncKey,
  DAY_MS,
  errorHandler,
  getSyncedValue,
} from '#libs/utils';
import { Source } from '#types/types';

const DAY_NS = 86_400_000_000_000n;
const OFFSET_NS = 3_000_000_000n; // 3s
const REBUILD_DAYS = 1n;
const CATCHUP_DAYS = 30n;

const window = async (source: Source) => {
  const [settings, events] = await Promise.all([
    db('settings')
      .where('key', balanceSyncKey(source.protocol, source.chain))
      .first(),
    db('settings').where('key', 'events').first(),
  ]);

  const last = events?.value?.timestamp as string | undefined;

  if (!last) return null;

  const lastDay = ((BigInt(last) - OFFSET_NS) / DAY_NS) * DAY_MS;
  const synced = settings?.value?.sync as string | undefined;

  let startDay: bigint;

  if (synced) {
    startDay = BigInt(synced) - REBUILD_DAYS * DAY_MS;
  } else {
    const first = await db
      .select('block_timestamp')
      .from('ft_events')
      .where('affected_account_id', source.address)
      .orderBy('block_timestamp', 'asc')
      .limit(1)
      .first();

    if (!first) return null;

    startDay = (BigInt(first.block_timestamp) / DAY_NS) * DAY_MS;
  }

  if (startDay > lastDay) return null;

  const endDay =
    lastDay - startDay > CATCHUP_DAYS * DAY_MS
      ? startDay + CATCHUP_DAYS * DAY_MS
      : lastDay;

  return { endDay, startDay };
};

const discoverTokens = async (
  source: Source,
  startDay: bigint,
  endDay: bigint,
) => {
  await db.raw(
    `
      INSERT INTO
        tvl_tokens (protocol, chain, token, symbol, decimals, coingecko_id, first_seen_date)
      SELECT DISTINCT
        ?,
        ?,
        e.contract_account_id,
        m.symbol,
        m.decimals,
        m.coingecko_id,
        ?
      FROM
        ft_events e
        LEFT JOIN ft_meta m ON m.contract = e.contract_account_id
      WHERE
        e.affected_account_id = ?
        AND e.block_timestamp >= ?
        AND e.block_timestamp < ?
      ON CONFLICT (protocol, chain, token) DO NOTHING
    `,
    [
      source.protocol,
      source.chain,
      startDay.toString(),
      source.address,
      (startDay * 1_000_000n).toString(),
      ((endDay + DAY_MS) * 1_000_000n).toString(),
    ],
  );
};

const foldBalances = async (
  trx: Knex,
  source: Source,
  startDay: bigint,
  endDay: bigint,
) => {
  await trx.raw(
    `
      WITH seed AS (
        SELECT DISTINCT ON (token) token, amount AS seed_amount
        FROM tvl_balances_daily
        WHERE protocol = ? AND chain = ? AND date < ?
        ORDER BY token, date DESC
      ),
      tokens AS (
        SELECT token FROM tvl_tokens WHERE protocol = ? AND chain = ?
      ),
      days AS (
        SELECT generate_series(?::BIGINT, ?::BIGINT, 86400000) AS date
      ),
      deltas AS (
        SELECT
          (block_timestamp / 86400000000000) * 86400000 AS date,
          contract_account_id AS token,
          SUM(delta_amount) AS delta
        FROM ft_events
        WHERE
          affected_account_id = ?
          AND block_timestamp >= ?
          AND block_timestamp < ?
        GROUP BY 1, 2
      ),
      grid AS (
        SELECT
          t.token,
          d.date,
          COALESCE(x.delta, 0) AS delta
        FROM tokens t
        CROSS JOIN days d
        LEFT JOIN deltas x ON x.token = t.token AND x.date = d.date
      )
      INSERT INTO
        tvl_balances_daily (date, protocol, chain, token, amount)
      SELECT
        g.date,
        ?,
        ?,
        g.token,
        COALESCE(s.seed_amount, 0) + SUM(g.delta) OVER (
          PARTITION BY g.token
          ORDER BY g.date
        )
      FROM grid g
        LEFT JOIN seed s ON s.token = g.token
      ON CONFLICT (date, protocol, chain, token) DO UPDATE
      SET amount = EXCLUDED.amount
    `,
    [
      source.protocol,
      source.chain,
      startDay.toString(),
      source.protocol,
      source.chain,
      startDay.toString(),
      endDay.toString(),
      source.address,
      (startDay * 1_000_000n).toString(),
      ((endDay + DAY_MS) * 1_000_000n).toString(),
      source.protocol,
      source.chain,
    ],
  );
};

const sync = async (source: Source) => {
  const win = await window(source);

  if (!win) return;

  const { endDay, startDay } = win;

  logger.info(
    `${source.protocol}/${source.chain}: days ${startDay} - ${endDay}`,
  );

  await discoverTokens(source, startDay, endDay);

  await db.transaction(async (trx) => {
    await foldBalances(trx, source, startDay, endDay);
    await trx('settings')
      .insert({
        key: balanceSyncKey(source.protocol, source.chain),
        value: { sync: endDay.toString() },
      })
      .onConflict('key')
      .merge();
  });
};

export const processSource = async (source: Source) => {
  const synced = await getSyncedValue(
    balanceSyncKey(source.protocol, source.chain),
  );

  if (synced === null) {
    logger.info(
      `${source.protocol}/${source.chain}: starting fold from genesis`,
    );
  }

  while (true) {
    try {
      await sync(source);
    } catch (error) {
      errorHandler(error);
    }

    await sleep(config.intervalMs);
  }
};
