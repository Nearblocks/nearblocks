import { logger } from 'nb-logger';

import { db } from '#libs/knex';
import * as evm from '#services/evm';
import * as solana from '#services/solana';
import { Chains, EvmChains } from '#types/enum';
import { Source } from '#types/types';

export const syncData = async () => {
  const sources = await db<Source>('tvl_sources').select('*');

  if (!sources.length) {
    throw new Error('tvl_sources is empty -- migration not applied?');
  }

  logger.info(`sources: ${sources.map((s) => s.chain).join(', ')}`);

  await Promise.all(
    sources
      .filter(
        (source) =>
          source.chain !== Chains.NEAR && source.chain !== EvmChains.POLYGON,
      )
      .map((source) => {
        if (source.chain === Chains.SOLANA) return solana.processSource(source);

        return evm.processSource(source);
      }),
  );
};
