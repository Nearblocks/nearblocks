import config from '#config';
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

const CACHE_TTL = 30;

export const getAccountFtBalances = async (
  account: string,
): Promise<FtBalance[] | null> => {
  const cacheKey = `fastnear:ft:${account}`;

  return redis.cache(
    cacheKey,
    async () => {
      const { fastnearApiKey, fastnearUrl } = config;
      const url = `${fastnearUrl}/v1/account/${account}/ft${
        fastnearApiKey ? `?apiKey=${fastnearApiKey}` : ''
      }`;

      try {
        const res = await globalThis.fetch(url, {
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) return null;

        const data = (await res.json()) as FastNearFtResponse;

        if (!data.tokens) return null;

        return data.tokens
          .filter((t) => /^\d+$/.test(t.balance))
          .map((t) => ({
            amount: t.balance,
            contract: t.contract_id,
          }));
      } catch {
        return null;
      }
    },
    CACHE_TTL,
  );
};
