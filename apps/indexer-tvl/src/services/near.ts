/* eslint-disable no-await-in-loop, no-constant-condition */
import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { db } from '#libs/knex';
import { balanceSyncKey, DAY_MS, getSyncedValue } from '#libs/utils';
import { Source } from '#types/types';

const DAY_NS = 86_400_000_000_000n;
const OFFSET_NS = 3_000_000_000n; // 3s
const REBUILD_DAYS = 1n;
const CATCHUP_DAYS = 30n;
const CAGG_LOOKBACK_DAYS = 3n;

const window = async (source: Source) => {
  const [settings, indexer, first] = await Promise.all([
    db('settings')
      .where('key', balanceSyncKey(source.protocol, source.chain))
      .first(),
    db('settings').where('key', 'ft_state').first(),
    db
      .select('block_timestamp')
      .from('ft_state_balances')
      .where('affected_account_id', source.address)
      .orderBy('block_timestamp', 'asc')
      .limit(1)
      .first(),
  ]);

  const last = indexer?.value?.timestamp as string | undefined;

  if (!last || !first) return null;

  const lastDay = ((BigInt(last) - OFFSET_NS) / DAY_NS) * DAY_MS;
  const genesisDay = (BigInt(first.block_timestamp) / DAY_NS) * DAY_MS;
  const synced = settings?.value?.sync as string | undefined;

  const startDay = synced ? BigInt(synced) - REBUILD_DAYS * DAY_MS : genesisDay;

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
        s.contract_account_id,
        m.symbol,
        m.decimals,
        m.coingecko_id,
        ?::BIGINT
      FROM
        ft_state_balances s
        LEFT JOIN ft_meta m ON m.contract = s.contract_account_id
      WHERE
        s.affected_account_id = ?
        AND s.block_timestamp >= ?
        AND s.block_timestamp < ?
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
  const tailCutoff = endDay - CAGG_LOOKBACK_DAYS * DAY_MS;

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
      readings AS (
        SELECT contract AS token, date, absolute_amount AS amount
        FROM account_ft_balances
        WHERE
          account = ?
          AND date >= ?
          AND date <= ?
          AND date < ?
        UNION ALL
        SELECT DISTINCT ON (contract_account_id, day)
          contract_account_id AS token,
          day AS date,
          absolute_amount AS amount
        FROM (
          SELECT
            contract_account_id,
            (block_timestamp / 86400000000000) * 86400000 AS day,
            absolute_amount,
            block_timestamp,
            shard_id,
            index_in_chunk
          FROM ft_state_balances
          WHERE affected_account_id = ? AND block_timestamp >= ?
        ) tail
        ORDER BY
          contract_account_id,
          day,
          block_timestamp DESC,
          shard_id DESC,
          index_in_chunk DESC
      ),
      filled AS (
        SELECT
          t.token,
          d.date,
          (
            SELECT r.amount FROM readings r
            WHERE r.token = t.token AND r.date <= d.date
            ORDER BY r.date DESC
            LIMIT 1
          ) AS amount
        FROM tokens t
        CROSS JOIN days d
      )
      INSERT INTO
        tvl_balances_daily (date, protocol, chain, token, amount)
      SELECT
        f.date, ?, ?, f.token, COALESCE(f.amount, s.seed_amount, 0)
      FROM filled f
        LEFT JOIN seed s ON s.token = f.token
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
      startDay.toString(),
      endDay.toString(),
      tailCutoff.toString(),
      source.address,
      (tailCutoff * 1_000_000n).toString(),
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
    `${source.protocol}/${source.chain}: syncing days, from: ${startDay}, to: ${endDay}`,
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
    logger.info(`${source.protocol}/${source.chain}: polling`);

    await sync(source);
    await sleep(config.intervalMs);
  }
};
