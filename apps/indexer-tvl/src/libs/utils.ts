import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import { RetryFailedError } from '#libs/errors';
import { db } from '#libs/knex';
import {
  RetryErrorContext,
  RetryInputContext,
  RetryOptions,
} from '#types/types';

export const DAY_MS = 86_400_000n;
export const NATIVE_TOKEN = 'native';

export const balanceSyncKey = (protocol: string, chain: string) =>
  `tvl_balances_${protocol}_${chain}`;

export const tokenSyncKey = (protocol: string, chain: string) =>
  `tvl_tokens_${protocol}_${chain}`;

export const getSyncedValue = async (key: string): Promise<bigint | null> => {
  const settings = await db('settings').where('key', key).first();
  const sync = settings?.value?.sync as string | undefined;

  return sync === undefined || sync === null ? null : BigInt(sync);
};

export const updateSyncedValue = async (
  trx: Knex,
  key: string,
  value: bigint,
) => {
  await trx('settings')
    .insert({ key, value: { sync: value.toString() } })
    .onConflict('key')
    .merge();
};

export const retryOnError = async ({
  attempts,
  error,
  label,
  retries,
}: RetryErrorContext) => {
  const suffix = label ? ` (${label})` : '';

  if (attempts < retries) {
    const wait = Math.pow(2, attempts) * 1000 + Math.random() * 250;
    logger.error(
      { attempts, err: error, retries },
      `retrying in ${Math.round(wait)}ms${suffix}`,
    );
    await sleep(wait);
  } else {
    logger.error(
      { attempts, err: error, retries },
      `retries exhausted${suffix}`,
    );
  }
};

export const retry = async <A>(
  input: (context: RetryInputContext) => Promise<A>,
  options?: RetryOptions,
): Promise<A> => {
  const { label, onError = retryOnError, retries = 10 } = options ?? {};

  for (let attempts = 1; attempts <= retries; attempts++) {
    try {
      return await input({ attempts });
    } catch (error) {
      await onError({ attempts, error, label, retries });
    }
  }

  throw new RetryFailedError(`all retries failed${label ? ` (${label})` : ''}`);
};

export const todayUtc = (): bigint => {
  const now = BigInt(Date.now());

  return (now / DAY_MS) * DAY_MS;
};
