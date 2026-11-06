import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { db } from '#libs/knex';
import Sentry from '#libs/sentry';
import { setChainsEnabled } from '#libs/utils';
import bitcoin from '#services/bitcoin';
import evm from '#services/evm';
import solana from '#services/solana';
import zcash from '#services/zcash';
import { Chains } from '#types/enum';

const RESTART_DELAY_MS = 30_000;
const MAX_RESTART_DELAY_MS = 300_000;
// A chain that ran this long before failing restarts from the shortest delay.
const HEALTHY_RUN_MS = 600_000;

/**
 * Runs one chain and restarts it after a failure with backoff, so a broken
 * upstream (quota, outage) stops only that chain instead of the process.
 * Resolves only when the chain is disabled.
 */
const supervise = async (
  chain: Chains,
  run: (chain: Chains) => Promise<unknown>,
) => {
  let delay = RESTART_DELAY_MS;
  for (;;) {
    const startedAt = Date.now();
    try {
      await run(chain);
      return;
    } catch (error) {
      if (Date.now() - startedAt >= HEALTHY_RUN_MS) delay = RESTART_DELAY_MS;
      logger.error(
        { chain, delayMs: delay, error },
        'chain sync failed, restarting',
      );
      await sleep(delay);
      delay = Math.min(delay * 2, MAX_RESTART_DELAY_MS);
    }
  }
};

export const syncData = async () => {
  const enabled = Object.entries(config.chains)
    .filter(([, chain]) => Boolean(chain.url))
    .map(([name]) => name);

  logger.info(
    `enabled chains: ${enabled.length ? enabled.join(', ') : 'none'}`,
  );

  try {
    await setChainsEnabled(enabled.map((name) => name.toLowerCase()));

    await Promise.all([
      supervise(Chains.ETHEREUM, evm.processBlocks),
      supervise(Chains.ARBITRUM, evm.processBlocks),
      supervise(Chains.AURORA, evm.processBlocks),
      supervise(Chains.BASE, evm.processBlocks),
      supervise(Chains.BSC, evm.processBlocks),
      supervise(Chains.GNOSIS, evm.processBlocks),
      supervise(Chains.OPTIMISM, evm.processBlocks),
      supervise(Chains.POLYGON, evm.processBlocks),
      supervise(Chains.SOLANA, solana.processBlocks),
      supervise(Chains.BITCOIN, bitcoin.processBlocks),
      supervise(Chains.ZCASH, zcash.processBlocks),
    ]);
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    await Promise.all([db.destroy(), Sentry.close(1_000)]);
    process.exit(1);
  }
};
