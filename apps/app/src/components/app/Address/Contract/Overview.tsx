// import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { RpcProviders } from '@/utils/app/rpc';
import { ContractCodeInfo } from '@/utils/types';

import OverviewActions from './OverviewActions';

const Overview = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const cookieStore = await cookies();
  const rpcUrl = cookieStore.get('rpcUrl')?.value || RpcProviders?.[0]?.url;

  const [data, parse, account] = await Promise.all([
    getRequest(
      `account/${id}/contract/deployments?rpc=${rpcUrl}`,
      searchParams,
      options,
    ),
    getRequest(`account/${id}/contract/parse?rpc=${rpcUrl}`, {}, options),
    getRequest(`account/${id}?rpc=${rpcUrl}`, {}, options),
  ]);

  return (
    <>
      <OverviewActions
        accountId={account?.account[0]?.account_id}
        contract={parse?.contract?.[0]?.contract as ContractCodeInfo}
        contractInfo={parse?.contract?.[0]?.contract}
        deployments={data}
        id={id}
        schema={parse?.contract?.[0]?.schema}
      />
    </>
  );
};
export default Overview;
