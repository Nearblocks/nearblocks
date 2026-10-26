import { logger } from 'nb-logger';

import { runBackfill } from '#scripts/backfillMissing';
import { cursorKey } from '#scripts/check';
import { db } from '#scripts/db';
import { findMissing } from '#scripts/findMissing';
import { refillDays } from '#scripts/range';
import { checkLanding, findDuplicates } from '#scripts/verify';

type Finding = {
  blocks: [number, number] | null;
  day: string;
  receipts: number;
};

const blockTimestamp = async (height: number) => {
  const row = await db('blocks')
    .where('block_height', '>=', height)
    .orderBy('block_height', 'asc')
    .first('block_timestamp');

  if (!row) throw new Error(`no block at or above height ${height}`);

  return BigInt(row.block_timestamp);
};

const loadFindings = async () => {
  const row = await db('settings').where({ key: cursorKey }).first();
  const findings: Finding[] = row?.value?.findings ?? [];

  return findings
    .filter(
      (finding) =>
        finding.receipts > 0 &&
        finding.blocks &&
        finding.day >= refillDays.from &&
        finding.day <= refillDays.to,
    )
    .sort((a, b) => a.day.localeCompare(b.day));
};

const refill = async (finding: Finding) => {
  const [first, last] = finding.blocks as [number, number];
  const from = await blockTimestamp(first);
  const to = await blockTimestamp(last + 1);
  const ids = await findMissing(db, from, to);

  logger.info(
    { blocks: finding.blocks, day: finding.day, missing: ids.size },
    'missing receipts found',
  );

  if (!ids.size) return 0;

  const result = await runBackfill(ids);
  const stillMissing = await findMissing(db, from, to);
  const duplicates = await findDuplicates(ids);
  const landing = await checkLanding(result.landing, result.expectedByTs);

  logger.info(
    {
      day: finding.day,
      duplicates: duplicates.length,
      landing,
      stillMissing: stillMissing.size,
    },
    'verification',
  );

  if (stillMissing.size || duplicates.length) {
    throw new Error(
      `backfill verification failed on ${finding.day}: stillMissing=${stillMissing.size} duplicates=${duplicates.length}`,
    );
  }

  return ids.size;
};

export const runReceiptsBackfill = async () => {
  const findings = await loadFindings();
  let refilled = 0;

  logger.info(
    { days: findings.length, refillDays },
    'receipts backfill starting',
  );

  for (const finding of findings) {
    const started = Date.now();
    const count = await refill(finding);

    refilled += count;

    logger.info(
      {
        day: finding.day,
        refilled: count,
        seconds: (Date.now() - started) / 1000,
      },
      'range done',
    );
  }

  logger.info(
    { days: findings.length, refilled },
    'receipts backfill completed',
  );
};
