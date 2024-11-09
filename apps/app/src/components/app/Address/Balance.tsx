import { cookies } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { RpcProviders } from '@/utils/app/rpc';
import { SpamToken } from '@/utils/types';

import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';

const getCookieFromRequest = (cookieName: string): null | string => {
  const cookie = cookies().get(cookieName);
  return cookie ? cookie.value : null;
};

export default async function Balance({ id }: { id: string }) {
  const rpcUrl = getCookieFromRequest('rpcUrl') || RpcProviders?.[0]?.url;

  const [
    accountData,
    statsData,
    tokenDetails,
    inventoryData,
    deploymentData,
    nftTokenData,
  ] = await Promise.all([
    getRequest(`account/${id}?rpc=${rpcUrl}`),
    getRequest('stats'),
    getRequest(`fts/${id}`),
    getRequest(`account/${id}/inventory`),
    getRequest(`account/${id}/contract/deployments?rpc=${rpcUrl}`),
    getRequest(`nfts/${id}`),
  ]);

  const spamList: SpamToken = await fetch(
    `https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json`,
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error('Failed to parse spam tokens JSON', error);
      return null;
    });

  return (
    <>
      <AccountAlerts accountData={accountData} id={id} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountOverview
          accountData={accountData?.account?.[0]}
          id={id}
          inventoryData={inventoryData?.inventory}
          spamTokens={spamList}
          statsData={statsData?.stats?.[0]}
          tokenData={tokenDetails?.contracts?.[0]}
        />
        <AccountMoreInfo
          accountData={accountData?.account?.[0]}
          deploymentData={deploymentData?.deployments?.[0]}
          id={id}
          nftTokenData={nftTokenData?.contracts?.[0]}
          tokenData={tokenDetails?.contracts?.[0]}
        />
      </div>
    </>
  );
}
