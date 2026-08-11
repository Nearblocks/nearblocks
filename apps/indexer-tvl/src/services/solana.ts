/* eslint-disable no-await-in-loop, no-constant-condition */
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { db } from '#libs/knex';
import { getSignaturesForAddress, getTransaction } from '#libs/solana';
import {
  balanceSyncKey,
  DAY_MS,
  errorHandler,
  retry,
  todayUtc,
} from '#libs/utils';
import { Source } from '#types/types';

const PAGE_LIMIT = 1000;
const MAX_SIGNATURES_PER_PASS = 500;
const SIGNATURE_CURSOR_PREFIX = 'tvl_signatures_';

type Balances = Map<string, bigint>;

const seedBalances = async (source: Source): Promise<Balances> => {
  const rows = await db('tvl_balances_daily')
    .distinctOn('token')
    .select('token', 'amount')
    .where({ chain: source.chain, protocol: source.protocol })
    .orderBy('token')
    .orderBy('date', 'desc');

  const balances: Balances = new Map();

  for (const row of rows) {
    balances.set(row.token as string, BigInt(row.amount as string));
  }

  return balances;
};

const ensureTokens = async (source: Source, mints: Map<string, number>) => {
  if (!mints.size) return;

  const known = await db('tvl_tokens')
    .where({ chain: source.chain, protocol: source.protocol })
    .whereIn('token', [...mints.keys()])
    .pluck('token');
  const knownSet = new Set(known);

  const rows = [...mints.entries()]
    .filter(([mint]) => !knownSet.has(mint))
    .map(([mint, decimals]) => ({
      chain: source.chain,
      coingecko_id: null,
      decimals,
      first_seen_date: todayUtc().toString(),
      protocol: source.protocol,
      symbol: null,
      token: mint,
    }));

  if (rows.length) {
    await db('tvl_tokens')
      .insert(rows)
      .onConflict(['protocol', 'chain', 'token'])
      .ignore();
  }
};

const emitDay = (
  rows: {
    amount: string;
    chain: string;
    date: string;
    protocol: string;
    token: string;
  }[],
  source: Source,
  day: bigint,
  balances: Balances,
) => {
  for (const [token, amount] of balances) {
    rows.push({
      amount: amount.toString(),
      chain: source.chain,
      date: day.toString(),
      protocol: source.protocol,
      token,
    });
  }
};

const sync = async (source: Source) => {
  const cursorKey =
    SIGNATURE_CURSOR_PREFIX + `${source.protocol}_${source.chain}`;
  const [cursor, daySettings] = await Promise.all([
    db('settings').where('key', cursorKey).first(),
    db('settings')
      .where('key', balanceSyncKey(source.protocol, source.chain))
      .first(),
  ]);
  const lastSignature = cursor?.value?.signature as string | undefined;

  const fresh: { blockTime: null | number; signature: string }[] = [];
  let before: string | undefined;
  let reachedKnown = false;

  while (fresh.length < MAX_SIGNATURES_PER_PASS) {
    const entries = await retry(
      () =>
        getSignaturesForAddress(config.solanaUrl, source.address, {
          before,
          limit: PAGE_LIMIT,
        }),
      { label: 'signatures' },
    );

    logger.info(
      `${source.protocol}/${source.chain}: signatures ${before ?? 'tip'}.. +${
        entries.length
      } (fresh ${fresh.length})`,
    );

    if (!entries.length) break; // reached genesis

    for (const entry of entries) {
      if (entry.signature === lastSignature) {
        reachedKnown = true;
        break;
      }

      if (!entry.err)
        fresh.push({ blockTime: entry.blockTime, signature: entry.signature });
    }

    if (reachedKnown || entries.length < PAGE_LIMIT) break;

    before = entries[entries.length - 1].signature;

    if (fresh.length < MAX_SIGNATURES_PER_PASS) {
      await sleep(config.solanaPageDelayMs);
    }
  }

  fresh.reverse(); // oldest first

  const balances = await seedBalances(source);
  const mints = new Map<string, number>();
  const rows: {
    amount: string;
    chain: string;
    date: string;
    protocol: string;
    token: string;
  }[] = [];

  let dayCursor = daySettings?.value?.sync
    ? BigInt(daySettings.value.sync as string) + DAY_MS
    : null;

  for (let i = 0; i < fresh.length; i++) {
    const entry = fresh[i];

    if (entry.blockTime === null) continue;

    const tx = await retry(
      () => getTransaction(config.solanaUrl, entry.signature),
      {
        label: `tx ${entry.signature}`,
      },
    );

    if (!tx?.meta) continue;

    const txDay = ((BigInt(entry.blockTime) * 1000n) / DAY_MS) * DAY_MS;

    dayCursor ??= txDay;

    while (dayCursor < txDay) {
      emitDay(rows, source, dayCursor, balances);
      dayCursor += DAY_MS;
    }

    for (const balance of tx.meta.postTokenBalances ?? []) {
      if (balance.owner !== source.address) continue;

      balances.set(balance.mint, BigInt(balance.uiTokenAmount.amount));
      mints.set(balance.mint, balance.uiTokenAmount.decimals);
    }

    logger.info(
      `${source.protocol}/${source.chain}: tx ${i + 1}/${
        fresh.length
      } day ${txDay} (${entry.signature})`,
    );

    if (i < fresh.length - 1) await sleep(config.solanaTxDelayMs);
  }

  const today = todayUtc();

  if (dayCursor !== null) {
    while (dayCursor <= today) {
      emitDay(rows, source, dayCursor, balances);
      dayCursor += DAY_MS;
    }
  }

  if (!fresh.length && dayCursor === null) return; // nothing to do yet

  await ensureTokens(source, mints);

  const yesterday = today - DAY_MS;
  const syncDay =
    dayCursor !== null && dayCursor - DAY_MS < yesterday
      ? dayCursor - DAY_MS
      : yesterday;

  await db.transaction(async (trx) => {
    if (rows.length) {
      await trx('tvl_balances_daily')
        .insert(rows)
        .onConflict(['date', 'protocol', 'chain', 'token'])
        .merge();
    }

    if (fresh.length) {
      await trx('settings')
        .insert({
          key: cursorKey,
          value: { signature: fresh[fresh.length - 1].signature },
        })
        .onConflict('key')
        .merge();
    }

    if (dayCursor !== null) {
      await trx('settings')
        .insert({
          key: balanceSyncKey(source.protocol, source.chain),
          value: { sync: syncDay.toString() },
        })
        .onConflict('key')
        .merge();
    }
  });

  logger.info(
    `${source.protocol}/${source.chain}: synced ${fresh.length} signatures, ${rows.length} rows, cursor ${syncDay}`,
  );
};

export const processSource = async (source: Source) => {
  if (!config.solanaUrl) return;

  while (true) {
    try {
      await sync(source);
    } catch (error) {
      errorHandler(error);
    }

    await sleep(config.intervalMs);
  }
};
