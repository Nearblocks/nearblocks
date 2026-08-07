import { logger } from 'nb-logger';

import config from '#config';
import { db } from '#libs/knex';
import Sentry from '#libs/sentry';
import bitcoin from '#services/bitcoin';
import evm from '#services/evm';
import solana from '#services/solana';
import zcash from '#services/zcash';
import { Chains } from '#types/enum';

export const syncData = async () => {
  const enabled = Object.entries(config.chains)
    .filter(([, chain]) => Boolean(chain.url))
    .map(([name]) => name);

  logger.info(
    `enabled chains: ${enabled.length ? enabled.join(', ') : 'none'}`,
  );

  try {
    await Promise.all([
      evm.processBlocks(Chains.ETHEREUM),
      evm.processBlocks(Chains.ARBITRUM),
      evm.processBlocks(Chains.AURORA),
      evm.processBlocks(Chains.BASE),
      evm.processBlocks(Chains.BSC),
      evm.processBlocks(Chains.GNOSIS),
      evm.processBlocks(Chains.OPTIMISM),
      evm.processBlocks(Chains.POLYGON),
      solana.processBlocks(Chains.SOLANA),
      bitcoin.processBlocks(Chains.BITCOIN),
      zcash.processBlocks(Chains.ZCASH),
    ]);
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    await Promise.all([db.destroy(), Sentry.close(1_000)]);
    process.exit(1);
  }
};
