'use server';

import { fetchTokenCache } from '@/data/address';

export const getCachedTokenBalance = async (
  account: string,
  contract: string,
): Promise<null | string> => {
  const cache = await fetchTokenCache(account);
  if (!cache) return null;
  const match = cache.find((t) => t.contract_id === contract);
  return match?.balance ?? '0';
};
