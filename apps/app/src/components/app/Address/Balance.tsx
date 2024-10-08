import { getRequest } from '@/utils/app/api';
import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';
import { SpamToken } from '@/utils/types';
import { cookies } from 'next/headers';
import { RpcProviders } from '@/utils/app/rpc';

const getCookieFromRequest = (cookieName: string): string | null => {
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
      <AccountAlerts id={id} accountData={accountData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountOverview
          id={id}
          accountData={accountData?.account?.[0]}
          statsData={statsData?.stats?.[0]}
          tokenData={tokenDetails?.contracts?.[0]}
          inventoryData={inventoryData?.inventory}
          spamTokens={spamList}
        />
        <AccountMoreInfo
          id={id}
          accountData={accountData?.account?.[0]}
          tokenData={tokenDetails?.contracts?.[0]}
          deploymentData={deploymentData?.deployments?.[0]}
          nftTokenData={nftTokenData?.contracts?.[0]}
        />
      </div>
    </>
  );
}
