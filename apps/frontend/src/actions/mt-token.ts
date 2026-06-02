'use server';

import type { AccountAssetMTFT, AccountAssetMTFTsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';
import { encodeToken } from '@/lib/utils';

export const getMTTokenHolderBalance = async (
  contract: string,
  token: string,
  account: string,
): Promise<AccountAssetMTFT | null> => {
  const resp = await fetcher<AccountAssetMTFTsRes>(
    `/v3/accounts/${account}/assets/mts/fts?contract=${contract}&token=${encodeToken(
      token,
    )}&limit=1`,
  );
  return resp?.data?.[0] ?? null;
};
