import { getRequest } from '@/utils/app/api';
import AccountMoreInfoActions from '@/components/app/Address/AccountMoreInfoActions';

export default async function AccountMoreInfo({ id }: any) {
  const accountData = getRequest(`v1/account/${id}`);
  const tokenDetails = getRequest(`v1/fts/${id}`);
  const deploymentData = getRequest(`v1/account/${id}/contract/deployments`);
  const nftTokenData = getRequest(`v1/nfts/${id}`);
  const syncData = getRequest(`v1/sync/status`);

  return (
    <AccountMoreInfoActions
      accountDataPromise={accountData}
      deploymentDataPromise={deploymentData}
      nftTokenDataPromise={nftTokenData}
      tokenDataPromise={tokenDetails}
      syncDataPromise={syncData}
    />
  );
}
