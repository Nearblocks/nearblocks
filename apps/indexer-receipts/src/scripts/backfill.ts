import { logger } from 'nb-logger';

import { runBackfill } from '#scripts/backfillMissing';
import { db } from '#scripts/db';
import { findMissing } from '#scripts/findMissing';
import { blockRange } from '#scripts/range';
import { checkLanding, findDuplicates } from '#scripts/verify';

const blockTimestamp = async (height: number) => {
  const row = await db('blocks')
    .where('block_height', '>=', height)
    .orderBy('block_height', 'asc')
    .first('block_timestamp');

  if (!row) throw new Error(`no block at or above height ${height}`);

  return BigInt(row.block_timestamp);
};

export const runReceiptsBackfill = async () => {
  logger.info({ blockRange }, 'receipts backfill starting');

  const from = await blockTimestamp(blockRange.from);
  const to = await blockTimestamp(blockRange.to + 1);
  const ids = await findMissing(db, from, to);

  logger.info({ missing: ids.size }, 'missing receipts found');

  const result = await runBackfill(ids);
  const stillMissing = await findMissing(db, from, to);
  const duplicates = await findDuplicates(ids);
  const landing = await checkLanding(result.landing, result.expectedByTs);

  logger.info(
    {
      duplicates: duplicates.length,
      landing,
      stillMissing: stillMissing.size,
    },
    'verification',
  );

  if (stillMissing.size || duplicates.length) {
    throw new Error(
      `backfill verification failed: stillMissing=${stillMissing.size} duplicates=${duplicates.length}`,
    );
  }

  logger.info('receipts backfill completed');
};
