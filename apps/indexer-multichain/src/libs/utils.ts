import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { RetryFailedError } from '#libs/errors';
import { dbRead, dbWrite } from '#libs/knex';
import sentry from '#libs/sentry';
import { Chains } from '#types/enum';
import {
  RetryErrorContext,
  RetryInputContext,
  RetryOptions,
} from '#types/types';

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

export const getKey = (chain: Chains) => {
  return `mpc_${chain.toLowerCase()}`;
};

export const getStartBlock = async (chain: Chains, start: number) => {
  const settings = await dbRead('settings')
    .where({ key: getKey(chain) })
    .first();

  const latestBlock = settings?.value?.sync;
  let startBlock = start;

  if (!startBlock && latestBlock) {
    logger.info(`${chain}: last synced block: ${latestBlock}`);
    startBlock = +latestBlock;
  }

  logger.info(`${chain}: syncing from block: ${startBlock}`);

  return startBlock;
};

export const updateProgress = async (chain: Chains, block: number) => {
  await dbWrite('settings')
    .insert({
      key: getKey(chain),
      value: { sync: block },
    })
    .onConflict('key')
    .merge();
};

export const retryOnError = async ({
  attempts,
  retries,
}: RetryErrorContext) => {
  if (attempts < retries) {
    await sleep(Math.pow(2, attempts) * 1000 + Math.random() * 250);
  }
};

export const retry = async <A>(
  input: (context: RetryInputContext) => Promise<A>,
  options?: RetryOptions,
): Promise<A> => {
  const config = options ?? { onError: retryOnError, retries: 10 };
  const { onError = retryOnError, retries = 10 } = config;

  for (let attempts = 1; attempts <= retries; attempts++) {
    try {
      return await input({ attempts });
    } catch (error) {
      await onError({
        attempts,
        error,
        retries,
      });
    }
  }

  throw new RetryFailedError('all retries failed');
};

export const secToNs = (timestamp: number) => {
  return (BigInt(timestamp) * 1_000_000_000n).toString();
};

export const migrationCheck = async (): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await dbRead
      .select(
        dbRead.raw(
          `
            EXISTS (
              SELECT
                1
              FROM
                information_schema.tables
              WHERE
                table_schema = 'public'
                AND table_name = 'multichain_transactions'
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
