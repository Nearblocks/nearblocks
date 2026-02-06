import { cache } from 'react';

import {
  Contract,
  ContractAction,
  ContractActionRes,
  ContractDeployment,
  ContractDeploymentRes,
  ContractRes,
  ContractSchema,
  ContractSchemaRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchContract = cache(
  async (account: string): Promise<Contract | null> => {
    const resp = await fetcher<ContractRes>(`/v3/accounts/${account}/contract`);
    return resp.data;
  },
);

export const fetchDeployments = cache(
  async (account: string): Promise<ContractDeployment[] | null> => {
    const resp = await fetcher<ContractDeploymentRes>(
      `/v3/accounts/${account}/contract/deployments`,
    );
    return resp.data;
  },
);

export const fetchSchema = cache(
  async (account: string): Promise<ContractSchema | null> => {
    const resp = await fetcher<ContractSchemaRes>(
      `/v3/accounts/${account}/contract/schema`,
    );
    return resp.data;
  },
);

export const fetchAction = cache(
  async (account: string, method: string): Promise<ContractAction | null> => {
    const resp = await fetcher<ContractActionRes>(
      `/v3/accounts/${account}/contract/${method}/action`,
    );
    return resp.data;
  },
);
