import { ExecutionStatus } from 'nb-blocks';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { db } from '#libs/knex';

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

export const migrationCheck = async (): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await db
      .select(
        db.raw(
          `
            EXISTS (
              SELECT
                1
              FROM
                information_schema.tables
              WHERE
                table_schema = 'public'
                AND table_name = 'balance_events'
            ) AS exists
          `,
        ),
      )
      .first();

    if (exists?.exists) return;

    logger.warn(`waiting for migration, checking again in 60s.`);
    await sleep(60_000); // 60s
  }
};
