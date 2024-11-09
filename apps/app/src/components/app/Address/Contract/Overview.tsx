// import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { RpcProviders } from '@/utils/app/rpc';
import { ContractCodeInfo } from '@/utils/types';

import OverviewActions from './OverviewActions';

const getCookieFromRequest = (cookieName: string): null | string => {
  const cookie = cookies().get(cookieName);
  return cookie ? cookie.value : null;
};

/*
const VmInitializer = dynamic(() => import('../../vm/VmInitializer'), {
  ssr: false,
});
*/

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
      {/* <VmInitializer /> */}
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
