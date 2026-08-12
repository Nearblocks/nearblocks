/* eslint-disable no-await-in-loop, no-constant-condition, no-restricted-syntax */
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { getDayBlock } from '#libs/blocks';
import { getBlockHeader, getCode, getLatestBlock, getLogs } from '#libs/evm';
import { db } from '#libs/knex';
import {
  aggregate3,
  Call3,
  decodeBalance,
  fetchTokenMeta,
  NATIVE_TOKEN,
  nativeBalanceCall,
  Result3,
  tokenBalanceCalls,
} from '#libs/multicall';
import { tvlDayHeight, tvlTokensDiscovered } from '#libs/prom';
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
const DISCOVERY_BATCH_CHUNKS = 20;
const MULTICALL_BATCH_SIZE = 100;
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
      first_seen_date: null,
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
    if (log.topics.length !== 3) continue;

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
  let chunksProcessed = 0;

  while (from <= safeTip && chunksProcessed < DISCOVERY_BATCH_CHUNKS) {
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
            first_seen_date: null,
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
    chunksProcessed++;

    await db('settings')
      .insert({ key, value: { sync: to } })
      .onConflict('key')
      .merge();

    if (from <= safeTip && chunksProcessed < DISCOVERY_BATCH_CHUNKS) {
      await sleep(chunkDelayMs);
    }
  }

  const [{ count }] = await db('tvl_tokens')
    .where({ chain: source.chain, protocol: source.protocol })
    .count<{ count: string }[]>('* as count');

  tvlTokensDiscovered.set(
    { chain: source.chain, protocol: source.protocol },
    Number(count),
  );
};

const decodeResult = (result: Result3): bigint => {
  if (!result.success || result.returnData === '0x') return 0n;

  try {
    return decodeBalance(result.returnData);
  } catch {
    return 0n;
  }
};

const snapshotBalances = async (
  url: string,
  bridge: string,
  tokenAddresses: string[],
  blockTag: string,
): Promise<{ native: Result3; tokens: Result3[] }> => {
  const [nativeResult] = await retry(
    () => aggregate3(url, [nativeBalanceCall(bridge)], blockTag),
    { label: `native @ ${blockTag}` },
  );

  const tokens: Result3[] = [];

  for (let i = 0; i < tokenAddresses.length; i += MULTICALL_BATCH_SIZE) {
    const batch = tokenAddresses.slice(i, i + MULTICALL_BATCH_SIZE);
    const calls: Call3[] = tokenBalanceCalls(bridge, batch);
    const results = await retry(() => aggregate3(url, calls, blockTag), {
      label: `tokens ${i}-${i + batch.length} @ ${blockTag}`,
    });

    tokens.push(...results);
  }

  return { native: nativeResult, tokens };
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
    const next = await getDayBlock(source.chain, url, day + DAY_MS, startBlock);

    if (next === null) break; // chain hasn't reached day D+1 yet
    const block = Math.max(next - 1, startBlock);

    const { native, tokens: tokenResults } = await snapshotBalances(
      url,
      source.address,
      tokenAddresses,
      '0x' + block.toString(16),
    );

    const rows = [
      {
        amount: decodeResult(native).toString(),
        chain: source.chain,
        date: day.toString(),
        protocol: source.protocol,
        token: NATIVE_TOKEN,
      },
      ...tokenAddresses.map((token, i) => ({
        amount: decodeResult(tokenResults[i]).toString(),
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

    tvlDayHeight.set(
      { chain: source.chain, protocol: source.protocol },
      Number(day),
    );

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

  if (processed > 0n) {
    await db.raw(
      `
        UPDATE tvl_tokens t
        SET first_seen_date = b.min_date
        FROM (
          SELECT token, MIN(date) AS min_date
          FROM tvl_balances_daily
          WHERE protocol = ? AND chain = ?
          GROUP BY token
        ) b
        WHERE t.protocol = ? AND t.chain = ? AND t.token = b.token AND t.first_seen_date IS NULL
      `,
      [source.protocol, source.chain, source.protocol, source.chain],
    );
  }
};

export const processSource = async (source: Source) => {
  const url = config.evm[source.chain as EvmChains].url;

  if (!url) return;

  let startBlock: number | undefined;

  while (true) {
    try {
      startBlock ??= await resolveStartBlock(source, url);
      await bootstrapNativeToken(source, startBlock);
      await discoverTokens(source, url, startBlock);
      await snapshotDays(source, url, startBlock);
    } catch (error) {
      errorHandler(error);
    }

    await sleep(config.intervalMs);
  }
};
