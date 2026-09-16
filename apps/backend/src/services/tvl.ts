import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import cg from '#libs/cg';
import { dbEvents } from '#libs/knex';

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 8;
const BACKOFF_MS = 24 * 60 * 60 * 1000;

const PLATFORMS: Record<string, string> = {
  arbitrum: 'arbitrum-one',
  base: 'base',
  bsc: 'binance-smart-chain',
  ethereum: 'ethereum',
  polygon: 'polygon-pos',
  solana: 'solana',
};

const syncNearFromFtMeta = async () => {
  await dbEvents.raw(`
    UPDATE tvl_tokens t
    SET
      coingecko_id = m.coingecko_id
    FROM
      ft_meta m
    WHERE
      t.chain = 'near'
      AND t.token = m.contract
      AND t.coingecko_id IS NULL
      AND m.coingecko_id IS NOT NULL
  `);
};

const resolveToken = async (row: {
  cg_attempts: number;
  chain: string;
  protocol: string;
  token: string;
}) => {
  const platform = PLATFORMS[row.chain];
  const where = { chain: row.chain, protocol: row.protocol, token: row.token };

  if (!platform) {
    // no CoinGecko platform for this chain -- exhaust attempts so it only
    // re-enters the batch on the backoff cutoff, not every pass.
    await dbEvents('tvl_tokens')
      .where(where)
      .update({ cg_attempts: MAX_ATTEMPTS, cg_checked_at: Date.now() });

    return;
  }

  try {
    const coingeckoId = await cg.searchByPlatform(platform, row.token);

    await dbEvents('tvl_tokens')
      .where(where)
      .update(
        coingeckoId
          ? { cg_checked_at: Date.now(), coingecko_id: coingeckoId }
          : { cg_attempts: row.cg_attempts + 1, cg_checked_at: Date.now() },
      );
  } catch (error) {
    logger.error(`tvlTokens: resolveToken: ${row.chain}/${row.token}`);
    logger.error(error);

    await dbEvents('tvl_tokens')
      .where(where)
      .update({ cg_attempts: row.cg_attempts + 1, cg_checked_at: Date.now() });
  }
};

export const syncTvlTokens = async () => {
  if (config.network === Network.TESTNET) return;

  await syncNearFromFtMeta();

  const backoffCutoff = Date.now() - BACKOFF_MS;

  const pending = await dbEvents('tvl_tokens')
    .whereNull('coingecko_id')
    .andWhereNot('chain', 'near')
    .andWhere((q) =>
      q
        .where('cg_attempts', '<', MAX_ATTEMPTS)
        .orWhere('cg_checked_at', '<', backoffCutoff),
    )
    .orderByRaw('cg_checked_at ASC NULLS FIRST')
    .select('protocol', 'chain', 'token', 'cg_attempts')
    .limit(BATCH_SIZE);

  await Promise.all(pending.map(resolveToken));
};
