import { getRequest } from '@/utils/app/api';
import AccountMoreInfoActions from './AccountMoreInfoActions';

export default async function AccountMoreInfo({ id }: any) {
  const options: RequestInit = { next: { revalidate: 10 } };

  const fetchCommonData = async (url?: string | undefined) => {
    try {
      if (url) {
        const response = await getRequest(url, {}, options);
        return response;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  };

  const [accountData, tokenDetails, deploymentData, nftTokenData, syncData] =
    await Promise.all([
      fetchCommonData(`account/${id}`),
      fetchCommonData(`fts/${id}`),
      fetchCommonData(`account/${id}/contract/deployments`),
      fetchCommonData(`nfts/${id}`),
      fetchCommonData(`sync/status`),
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
