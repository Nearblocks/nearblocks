import { getRequest } from '@/utils/app/api';
import OverviewActions from './OverviewActions';
import { ContractCodeInfo } from '@/utils/types';
import { cookies } from 'next/headers';
import { RpcProviders } from '@/utils/app/rpc';

const getCookieFromRequest = (cookieName: string): string | null => {
  const cookie = cookies().get(cookieName);
  return cookie ? cookie.value : null;
};

const Overview = async ({ id, searchParams }: any) => {
  const rpcUrl = getCookieFromRequest('rpcUrl') || RpcProviders?.[0]?.url;

  const [data, parse, account] = await Promise.all([
    getRequest(
      `account/${id}/contract/deployments?rpc=${rpcUrl}`,
      searchParams,
    ),
    getRequest(`account/${id}/contract/parse?rpc=${rpcUrl}`),
    getRequest(`account/${id}?rpc=${rpcUrl}`),
  ]);

  return (
    <>
      <OverviewActions
        id={id}
        schema={parse?.contract?.[0]?.schema}
        contract={parse?.contract?.[0]?.contract as ContractCodeInfo}
        contractInfo={parse?.contract?.[0]?.contract}
        deployments={data}
        accountId={account?.account[0]?.account_id}
      />
    </>
  );
};
export default Overview;
