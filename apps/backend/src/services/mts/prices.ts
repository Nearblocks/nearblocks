import { logger } from 'nb-logger';
import { MTPrice, Network } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import intents from '#libs/intents';
import { dbEvents } from '#libs/knex';
import { Raw } from '#types/types';

const BATCH_SIZE = 125;
const BATCH_DELAY_MS = 60_000;
const UPSERT_CHUNK_SIZE = 1000;

// intents blockchain -> cg asset platform id
const CG_PLATFORMS: Record<string, string> = {
  abs: 'abstract',
  aptos: 'aptos',
  arb: 'arbitrum-one',
  avax: 'avalanche',
  base: 'base',
  bera: 'berachain',
  bsc: 'binance-smart-chain',
  eth: 'ethereum',
  gnosis: 'xdai',
  monad: 'monad',
  movement: 'movement',
  near: 'near-protocol',
  op: 'optimistic-ethereum',
  plasma: 'plasma',
  pol: 'polygon-pos',
  scroll: 'scroll',
  sol: 'solana',
  starknet: 'starknet',
  stellar: 'stellar',
  sui: 'sui',
  ton: 'the-open-network',
  tron: 'tron',
  xlayer: 'x-layer',
};

// intents blockchain -> cg coin id for native assets
const CG_NATIVE_IDS: Record<string, string> = {
  abs: 'ethereum',
  adi: 'adi-token',
  aleo: 'aleo',
  aptos: 'aptos',
  arb: 'ethereum',
  avax: 'avalanche-2',
  base: 'ethereum',
  bch: 'bitcoin-cash',
  bera: 'berachain-bera',
  bsc: 'binancecoin',
  btc: 'bitcoin',
  cardano: 'cardano',
  dash: 'dash',
  doge: 'dogecoin',
  eth: 'ethereum',
  ltc: 'litecoin',
  monad: 'monad',
  movement: 'movement',
  near: 'near',
  op: 'ethereum',
  plasma: 'plasma',
  pol: 'polygon-ecosystem-token',
  scroll: 'ethereum',
  sol: 'solana',
  starknet: 'starknet',
  stellar: 'stellar',
  sui: 'sui',
  ton: 'the-open-network',
  tron: 'tron',
  xlayer: 'okb',
  xrp: 'ripple',
  zec: 'zcash',
};

type IntentsTokenRow = {
  blockchain: string;
  contract: null | string;
  token: string;
};

export const syncMTPrices = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const { rows: tokens } = await dbEvents.raw<Raw<IntentsTokenRow>>(
    `
      SELECT
        token,
        contract,
        blockchain
      FROM
        mt_intents_tokens
    `,
  );

  if (!tokens.length) {
    return;
  }

  const platforms = new Map<
    string,
    Map<string, { contract: string; tokens: string[] }>
  >();
  const natives = new Map<string, string[]>();

  for (const token of tokens) {
    // intents uses literal 'coin' as contract for some native assets
    if (!token.contract || token.contract === 'coin') {
      const id = CG_NATIVE_IDS[token.blockchain];

      if (id) {
        natives.set(id, [...(natives.get(id) ?? []), token.token]);
      }

      continue;
    }

    const platform = CG_PLATFORMS[token.blockchain];

    if (!platform) {
      continue;
    }

    const contracts =
      platforms.get(platform) ??
      new Map<string, { contract: string; tokens: string[] }>();
    const key = token.contract.toLowerCase();
    const entry = contracts.get(key) ?? {
      contract: token.contract,
      tokens: [],
    };
    entry.tokens.push(token.token);
    contracts.set(key, entry);
    platforms.set(platform, contracts);
  }

  const date = String(dayjs.utc().startOf('day').valueOf());
  const prices = new Map<string, MTPrice>();
  let calls = 0;

  for (const [platform, contracts] of platforms) {
    const entries = [...contracts.entries()];

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      if (calls > 0 && calls % BATCH_SIZE === 0) {
        await sleep(BATCH_DELAY_MS);
      }

      const batch = entries.slice(i, i + BATCH_SIZE);
      const data = await cg.prices(
        batch.map(([, entry]) => entry.contract),
        platform,
      );
      calls++;

      if (!data) {
        continue;
      }

      const priced = new Map(
        Object.entries(data).map(([key, value]) => [key.toLowerCase(), value]),
      );

      for (const [key, entry] of batch) {
        const usd = priced.get(key)?.usd;

        if (usd == null) {
          continue;
        }

        for (const token of entry.tokens) {
          prices.set(token, {
            date,
            price: String(usd),
            source: 'coingecko',
            token,
          });
        }
      }
    }
  }

  if (natives.size) {
    if (calls > 0 && calls % BATCH_SIZE === 0) {
      await sleep(BATCH_DELAY_MS);
    }

    const data = await cg.ids([...natives.keys()]);
    calls++;

    if (data) {
      for (const [id, assets] of natives) {
        const usd = data[id]?.usd;

        if (usd == null) {
          continue;
        }

        for (const token of assets) {
          prices.set(token, {
            date,
            price: String(usd),
            source: 'coingecko',
            token,
          });
        }
      }
    }
  }

  // 1click fallback for tokens cg can't price
  const known = new Set(tokens.map((t) => t.token));
  const data = await intents.price();

  for (const item of data ?? []) {
    if (
      item.assetId &&
      item.price != null &&
      known.has(item.assetId) &&
      !prices.has(item.assetId)
    ) {
      prices.set(item.assetId, {
        date,
        price: String(item.price),
        source: 'intents',
        token: item.assetId,
      });
    }
  }

  const rows = [...prices.values()];

  if (!rows.length) {
    return;
  }

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    await dbEvents('mt_prices')
      .insert(rows.slice(i, i + UPSERT_CHUNK_SIZE))
      .onConflict(['token', 'date'])
      .merge();
  }

  logger.info(`tokenPrices: updated ${rows.length} mt prices`);
};
