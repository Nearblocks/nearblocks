'use server';

import { ContractActionRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const action = async (account: string, method: string) => {
  if (!account || !method) return null;

  const resp = await fetcher<ContractActionRes>(
    `/v3/accounts/${account}/contract/${method}/action`,
  );

  return resp.data;
};
