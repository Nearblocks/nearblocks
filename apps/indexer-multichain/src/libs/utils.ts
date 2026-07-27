import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { RetryFailedError } from '#libs/errors';
import { db } from '#libs/knex';
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
  const settings = await db('settings')
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
  await db('settings')
    .insert({
      key: getKey(chain),
      value: { sync: block },
    })
    .onConflict('key')
    .merge();
};

export const retryOnError = async ({
  attempts,
  chain,
  error,
  label,
  retries,
}: RetryErrorContext) => {
  const prefix = chain ? `${chain}: ` : '';
  const suffix = label ? ` (${label})` : '';

  if (attempts < retries) {
    const wait = Math.pow(2, attempts) * 1000 + Math.random() * 250;
    logger.error(
      { attempts, chain, err: error, retries },
      `${prefix}retrying in ${Math.round(wait)}ms${suffix}`,
    );
    await sleep(wait);
  } else {
    logger.error(
      { attempts, chain, err: error, retries },
      `${prefix}retries exhausted${suffix}`,
    );
  }
};

export const retry = async <A>(
  input: (context: RetryInputContext) => Promise<A>,
  options?: RetryOptions,
): Promise<A> => {
  const config = options ?? { onError: retryOnError, retries: 10 };
  const { chain, label, onError = retryOnError, retries = 10 } = config;

  for (let attempts = 1; attempts <= retries; attempts++) {
    try {
      return await input({ attempts });
    } catch (error) {
      await onError({
        attempts,
        chain,
        error,
        label,
        retries,
      });
    }
  }

  throw new RetryFailedError('all retries failed');
};

export const secToNs = (timestamp: number) => {
  return (BigInt(timestamp) * 1_000_000_000n).toString();
};
