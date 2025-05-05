import { createRequire } from 'module';

import { ExecutionStatus } from 'nb-blocks';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { db } from '#libs/knex';
import sentry from '#libs/sentry';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

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
                AND table_name = 'multichain_signatures'
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
