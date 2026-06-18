'use server';

import { fetchFTBalance } from '@/data/address';

export const getCachedTokenBalance = async (
  account: string,
  contract: string,
): Promise<null | string> => {
  return fetchFTBalance(account, contract);
};
