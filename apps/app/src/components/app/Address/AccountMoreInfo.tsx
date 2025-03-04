import { getRequest } from '@/utils/app/api';
import AccountMoreInfoActions from './AccountMoreInfoActions';

export default async function AccountMoreInfo({ id }: any) {
  const options: RequestInit = { next: { revalidate: 10 } };

  const [accountData, tokenDetails, deploymentData, nftTokenData, syncData] =
    await Promise.all([
      getRequest(`account/${id}`, {}, options),
      getRequest(`fts/${id}`, {}, options),
      getRequest(`account/${id}/contract/deployments`, {}, options),
      getRequest(`nfts/${id}`, {}, options),
      getRequest(`sync/status`, {}, options),
    ]);

  const balanceIndexerStatus =
    syncData && syncData?.status?.indexers?.balance?.sync;
  return (
    <AccountMoreInfoActions
      accountData={accountData?.account?.[0]}
      deploymentData={deploymentData?.deployments?.[0]}
      nftTokenData={nftTokenData?.contracts?.[0]}
      tokenData={tokenDetails?.contracts?.[0]}
      status={balanceIndexerStatus}
    />
  );
}
