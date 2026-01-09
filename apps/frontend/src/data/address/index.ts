import {
  AccountAssetFTsRes,
  AccountBalanceRes,
  AccountRes,
  ContractDeploymentRes,
} from 'nb-schemas';

import { getServerConfig } from '@/lib/config';
import { fetcher } from '@/lib/fetcher';
import { TokensCacheRes } from '@/types/types';

export const fetchAccount = async (account: string) => {
  const resp = await fetcher<AccountRes>(`/v3/accounts/${account}`);
  return resp.data;
};

export const fetchBalance = async (account: string) => {
  const resp = await fetcher<AccountBalanceRes>(
    `/v3/accounts/${account}/balance`,
  );
  return resp.data;
};

export const fetchDeployments = async (account: string) => {
  const resp = await fetcher<ContractDeploymentRes>(
    `/v3/accounts/${account}/contract/deployments`,
  );
  return resp.data;
};

export const fetchTokens = async (account: string) => {
  const resp = await fetcher<AccountAssetFTsRes>(
    `/v3/accounts/${account}/assets/fts?limit=100`,
  );
  return resp.data;
};

export const fetchTokenCache = async (account: string) => {
  try {
    const config = getServerConfig();
    const apiKey = config.NEXT_PUBLIC_FASTNEAR_RPC_KEY;

    const res = await fetch(
      `https://api.fastnear.com/v1/account/${account}/ft?apiKey=${apiKey}`,
    );

    if (!res.ok) return null;

    const resp = (await res.json()) as TokensCacheRes;
    return resp.tokens;
  } catch {
    return null;
  }
};
