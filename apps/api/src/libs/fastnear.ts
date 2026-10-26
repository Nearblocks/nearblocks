import config from '#config';
import logger from '#libs/logger';
import { fastnearFtLookups, fastnearRequests } from '#libs/promMetrics';
import redis from '#libs/redis';

type FastNearFtToken = {
  balance: string;
  contract_id: string;
};

type FastNearFtResponse = {
  account_id: string;
  tokens: FastNearFtToken[] | null;
};

export type FtBalance = {
  amount: string;
  contract: string;
};

type CachedBalances = {
  tokens: FtBalance[] | null;
};

const CACHE_TTL = 60;
const COOLDOWN_KEY = 'fastnear:cooldown';
const COOLDOWN_TTL = 60;
const LOCK_TTL_MS = 6000;
const REQUEST_TIMEOUT_MS = 5000;
const WAIT_MAX_MS = 1500;
const WAIT_STEP_MS = 150;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const readCache = async (key: string): Promise<CachedBalances | null> => {
  try {
    const value = await redis.get(key);

    return value ? (JSON.parse(value) as CachedBalances) : null;
  } catch {
    return null;
  }
};

const writeCache = async (key: string, tokens: FtBalance[] | null) => {
  try {
    await redis.stringify(key, { tokens }, CACHE_TTL);
  } catch (error) {
    logger.warn(error, 'fastnear: cache write failed');
  }
};

const isCoolingDown = async (): Promise<boolean> => {
  try {
    return !!(await redis.get(COOLDOWN_KEY));
  } catch {
    return false;
  }
};

const startCooldown = async () => {
  try {
    await redis.set(COOLDOWN_KEY, '1', COOLDOWN_TTL);
  } catch (error) {
    logger.warn(error, 'fastnear: cooldown write failed');
  }
};

const fetchBalances = async (account: string): Promise<FtBalance[] | null> => {
  const { fastnearApiKey, fastnearUrl } = config;
  const url = `${fastnearUrl}/v1/account/${account}/ft${
    fastnearApiKey ? `?apiKey=${fastnearApiKey}` : ''
  }`;

  try {
    const res = await globalThis.fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    fastnearRequests.inc({ status: String(res.status) });

    if (!res.ok) {
      if (res.status === 429) await startCooldown();

      logger.warn(`fastnear: ${account}: status ${res.status}`);

      return null;
    }

    const data = (await res.json()) as FastNearFtResponse;

    if (!data.tokens) return null;

    return data.tokens
      .filter((t) => /^\d+$/.test(t.balance))
      .map((t) => ({
        amount: t.balance,
        contract: t.contract_id,
      }));
  } catch (error) {
    const name = (error as Error).name;
    fastnearRequests.inc({
      status: name === 'TimeoutError' ? 'timeout' : 'error',
    });
    logger.warn(`fastnear: ${account}: ${name}`);

    return null;
  }
};

const waitForCache = async (key: string): Promise<CachedBalances | null> => {
  for (let waited = 0; waited < WAIT_MAX_MS; waited += WAIT_STEP_MS) {
    await wait(WAIT_STEP_MS);

    const cached = await readCache(key);

    if (cached) return cached;
  }

  return null;
};

export const getAccountFtBalances = async (
  account: string,
): Promise<FtBalance[] | null> => {
  const cacheKey = `fastnear:ft:v2:${account}`;
  const lockKey = redis.prefixedKeys(`fastnear:lock:${account}`);

  const cached = await readCache(cacheKey);

  if (cached) {
    fastnearFtLookups.inc({ result: 'cache_hit' });
    return cached.tokens;
  }

  if (await isCoolingDown()) {
    fastnearFtLookups.inc({ result: 'cooldown' });
    return null;
  }

  let locked: null | string = 'OK';

  try {
    locked = await redis.client().set(lockKey, '1', 'PX', LOCK_TTL_MS, 'NX');
  } catch {
    locked = 'OK';
  }

  if (locked !== 'OK') {
    const shared = await waitForCache(cacheKey);
    fastnearFtLookups.inc({ result: shared ? 'wait_hit' : 'wait_miss' });

    return shared ? shared.tokens : null;
  }

  try {
    fastnearFtLookups.inc({ result: 'fetched' });
    const tokens = await fetchBalances(account);

    await writeCache(cacheKey, tokens);

    return tokens;
  } finally {
    await redis
      .client()
      .del(lockKey)
      .catch(() => 0);
  }
};
