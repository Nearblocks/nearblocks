import { logger } from 'nb-logger';

import { db } from '#libs/knex';
import Sentry from '#libs/sentry';
import * as evm from '#services/evm';
import * as near from '#services/near';
import * as solana from '#services/solana';
import { Chains } from '#types/enum';
import { Source } from '#types/types';

export const syncData = async () => {
  try {
    const sources = await db<Source>('tvl_sources').select('*');

    logger.info(`sources: ${sources.map((s) => s.chain).join(', ')}`);

    await Promise.all(
      sources.map((source) => {
        if (source.chain === Chains.NEAR) return near.processSource(source);
        if (source.chain === Chains.SOLANA) return solana.processSource(source);

        return evm.processSource(source);
      }),
    );
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    await Promise.all([db.destroy(), Sentry.close(1_000)]);
    process.exit(1);
  }
};
