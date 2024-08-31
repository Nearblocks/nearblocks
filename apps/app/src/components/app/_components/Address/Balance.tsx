import { getRequest } from '@/app/utils/api';
import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';
import { SpamToken } from '@/app/utils/types';

export default async function Balance({ id }: { id: string }) {
  // Use Promise.all to fetch all data concurrently
  const [
    accountData,
    statsData,
    tokenDetails,
    inventoryData,
    deploymentData,
    nftTokenData,
    spamList,
  ] = await Promise.all([
    getRequest(`account/${id}`),
    getRequest('stats'),
    getRequest(`fts/${id}`),
    getRequest(`account/${id}/inventory`),
    getRequest(`account/${id}/contract/deployments`),
    getRequest(`nfts/${id}`),
    getRequest(
      'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
    ),
  ]);

  // Process the spam token list
  const spamTokensString = spamList && spamList.replace(/,\s*([}\]])/g, '$1');
  const spamTokens: SpamToken =
    spamTokensString && JSON.parse(spamTokensString);

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
          spamTokens={spamTokens}
        />
        <AccountMoreInfo
          accountData={accountData?.account?.[0]}
          tokenData={tokenDetails?.contracts?.[0]}
          deploymentData={deploymentData?.deployments?.[0]}
          nftTokenData={nftTokenData?.contracts?.[0]}
        />
      </div>
    </>
  );
}
