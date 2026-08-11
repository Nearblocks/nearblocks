/* eslint-disable no-await-in-loop, no-constant-condition, no-restricted-syntax */
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { getDayBlock } from '#libs/blocks';
import { getBlockHeader, getCode, getLatestBlock, getLogs } from '#libs/evm';
import { db } from '#libs/knex';
import {
  aggregate3,
  balanceCalls,
  Call3,
  fetchTokenMeta,
  NATIVE_TOKEN,
  Result3,
} from '#libs/multicall';
import { tvlTokensDiscovered } from '#libs/prom';
import {
  balanceSyncKey,
  DAY_MS,
  errorHandler,
  getSyncedValue,
  retry,
  todayUtc,
  tokenSyncKey,
  updateSyncedValue,
} from '#libs/utils';
import { EvmChains } from '#types/enum';
import { Source } from '#types/types';

const TRANSFER_TOPIC0 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const CONFIRMATIONS = 30;
const SNAPSHOT_BATCH_DAYS = 10n;
const NATIVE_META: Record<
  EvmChains,
  { coingeckoId: string; decimals: number; symbol: string }
> = {
  [EvmChains.ARBITRUM]: {
    coingeckoId: 'ethereum',
    decimals: 18,
    symbol: 'ETH',
  },
  [EvmChains.BASE]: { coingeckoId: 'ethereum', decimals: 18, symbol: 'ETH' },
  [EvmChains.BSC]: { coingeckoId: 'binancecoin', decimals: 18, symbol: 'BNB' },
  [EvmChains.ETHEREUM]: {
    coingeckoId: 'ethereum',
    decimals: 18,
    symbol: 'ETH',
  },
  [EvmChains.POLYGON]: {
    coingeckoId: 'polygon-ecosystem-token',
    decimals: 18,
    symbol: 'POL',
  },
};

const topicAddress = (address: string) =>
  '0x' + '0'.repeat(24) + address.toLowerCase().slice(2);

const bootstrapNativeToken = async (source: Source, startBlock: number) => {
  const meta = NATIVE_META[source.chain as EvmChains];

  await db('tvl_tokens')
    .insert({
      chain: source.chain,
      coingecko_id: meta.coingeckoId,
      decimals: meta.decimals,
      first_seen_block: startBlock,
      first_seen_date: todayUtc().toString(),
      protocol: source.protocol,
      symbol: meta.symbol,
      token: NATIVE_TOKEN,
    })
    .onConflict(['protocol', 'chain', 'token'])
    .ignore();
};

const resolveStartBlock = async (source: Source, url: string) => {
  if (source.start_block) return Number(source.start_block);

  logger.info(`${source.protocol}/${source.chain}: resolving deployment block`);

  const tip = await retry(() => getLatestBlock(url), { label: 'tip' });
  let lo = 0;
  let hi = tip;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const code = await retry(
      () => getCode(url, source.address, '0x' + mid.toString(16)),
      { label: `code ${mid}` },
    );

    if (code === '0x') {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  await db('tvl_sources')
    .where({ chain: source.chain, protocol: source.protocol })
    .update({ start_block: lo });

  logger.info(`${source.protocol}/${source.chain}: deployment block ${lo}`);

  return lo;
};

const sweepTransfers = async (
  url: string,
  bridge: string,
  fromBlock: number,
  toBlock: number,
): Promise<string[]> => {
  const padded = topicAddress(bridge);

  const [incoming, outgoing] = await Promise.all([
    retry(
      () =>
        getLogs(url, {
          fromBlock,
          toBlock,
          topics: [TRANSFER_TOPIC0, null, padded],
        }),
      { label: `logs in ${fromBlock}-${toBlock}` },
    ),
    retry(
      () =>
        getLogs(url, {
          fromBlock,
          toBlock,
          topics: [TRANSFER_TOPIC0, padded, null],
        }),
      { label: `logs out ${fromBlock}-${toBlock}` },
    ),
  ]);

  const tokens = new Set<string>();

  for (const log of [...incoming, ...outgoing]) {
    tokens.add(log.address.toLowerCase());
  }

  return [...tokens];
};

const discoverTokens = async (
  source: Source,
  url: string,
  startBlock: number,
) => {
  const key = tokenSyncKey(source.protocol, source.chain);
  const synced = await getSyncedValue(key);
  const tip = await retry(() => getLatestBlock(url), { label: 'tip' });
  const safeTip = tip - CONFIRMATIONS;

  let from = synced !== null ? Number(synced) + 1 : startBlock;
  const { chunkDelayMs, logChunkBlocks: chunk } =
    config.evm[source.chain as EvmChains];

  while (from <= safeTip) {
    const to = Math.min(from + chunk - 1, safeTip);

    logger.info(
      `${source.protocol}/${
        source.chain
      }: sweeping blocks ${from}..${to} (tip ${safeTip}, lag ${safeTip - to})`,
    );

    const tokens = await sweepTransfers(url, source.address, from, to);

    if (tokens.length) {
      const known = await db('tvl_tokens')
        .whereIn('token', tokens)
        .andWhere({ chain: source.chain, protocol: source.protocol })
        .pluck('token');
      const knownSet = new Set(known);
      const fresh = tokens.filter((token) => !knownSet.has(token));

      for (const token of fresh) {
        const meta = await retry(() => fetchTokenMeta(url, token), {
          label: `meta ${token}`,
        });

        await db('tvl_tokens')
          .insert({
            chain: source.chain,
            coingecko_id: null,
            decimals: meta.decimals,
            first_seen_block: to,
            first_seen_date: todayUtc().toString(),
            protocol: source.protocol,
            symbol: meta.symbol,
            token,
          })
          .onConflict(['protocol', 'chain', 'token'])
          .ignore();

        logger.info(
          `${source.protocol}/${source.chain}: discovered token ${token} (${
            meta.symbol ?? '?'
          })`,
        );
      }
    }

    from = to + 1;

    await db('settings')
      .insert({ key, value: { sync: to } })
      .onConflict('key')
      .merge();

    if (from <= safeTip) await sleep(chunkDelayMs);
  }

  const [{ count }] = await db('tvl_tokens')
    .where({ chain: source.chain, protocol: source.protocol })
    .count<{ count: string }[]>('* as count');

  tvlTokensDiscovered.set(
    { chain: source.chain, protocol: source.protocol },
    Number(count),
  );
};

const decodeAmount = (result: Result3): bigint => {
  if (!result.success || result.returnData === '0x') return 0n;

  try {
    return BigInt(result.returnData.slice(0, 66)); // first word, tolerate trailing/odd data
  } catch {
    return 0n;
  }
};

const snapshotDays = async (
  source: Source,
  url: string,
  startBlock: number,
) => {
  const key = balanceSyncKey(source.protocol, source.chain);
  const synced = await getSyncedValue(key);

  const tokens = await db('tvl_tokens')
    .where({ chain: source.chain, protocol: source.protocol })
    .andWhereNot('token', NATIVE_TOKEN)
    .select('token');
  const tokenAddresses = tokens.map((t) => t.token as string);

  let day: bigint;

  if (synced !== null) {
    day = synced + DAY_MS;
  } else {
    const header = await retry(() => getBlockHeader(url, startBlock), {
      label: `header ${startBlock}`,
    });
    const ts = header
      ? BigInt(parseInt(header.timestamp, 16)) * 1000n
      : todayUtc();

    day = (ts / DAY_MS) * DAY_MS;
  }

  const yesterday = todayUtc() - DAY_MS; // today is not final yet
  let processed = 0n;

  while (day <= yesterday && processed < SNAPSHOT_BATCH_DAYS) {
    const block = await getDayBlock(source.chain, url, day);

    if (block === null) break; // chain hasn't reached this day yet

    const calls: Call3[] = balanceCalls(source.address, tokenAddresses);
    const results = await retry(
      () => aggregate3(url, calls, '0x' + block.toString(16)),
      { label: `snapshot ${source.chain} day ${day}` },
    );

    const rows = [
      {
        amount: decodeAmount(results[0]).toString(),
        chain: source.chain,
        date: day.toString(),
        protocol: source.protocol,
        token: NATIVE_TOKEN,
      },
      ...tokenAddresses.map((token, i) => ({
        amount: decodeAmount(results[i + 1]).toString(),
        chain: source.chain,
        date: day.toString(),
        protocol: source.protocol,
        token,
      })),
    ];

    await db.transaction(async (trx) => {
      await trx('tvl_balances_daily')
        .insert(rows)
        .onConflict(['date', 'protocol', 'chain', 'token'])
        .merge();
      await updateSyncedValue(trx, key, day);
    });

    logger.info(
      `${source.protocol}/${source.chain}: day ${day} @ block ${block} (lag ${
        (yesterday - day) / DAY_MS
      }d)`,
    );

    day += DAY_MS;
    processed += 1n;

    if (day <= yesterday && processed < SNAPSHOT_BATCH_DAYS) {
      await sleep(config.snapshotDayDelayMs);
    }
  }
};

export const processSource = async (source: Source) => {
  const url = config.evm[source.chain as EvmChains].url;

  if (!url) return;

  let startBlock: number;

  try {
    startBlock = await resolveStartBlock(source, url);
    await bootstrapNativeToken(source, startBlock);
  } catch (error) {
    errorHandler(error);

    return;
  }

  while (true) {
    try {
      await discoverTokens(source, url, startBlock);
      await snapshotDays(source, url, startBlock);
    } catch (error) {
      errorHandler(error);
    }

    await sleep(config.intervalMs);
  }
};
