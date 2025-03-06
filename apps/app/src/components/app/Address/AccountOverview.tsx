import { getRequest } from '@/utils/app/api';
import AccountOverviewActions from './AccountOverviewActions';
import { SpamToken } from '@/utils/types';

export default async function AccountOverview({ id }: any) {
  const fetchCommonData = async (url?: string | undefined) => {
    try {
      if (url) {
        const response = await getRequest(url);
        return response;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  };

  const [accountData, statsData, tokenDetails, inventoryData, syncData] =
    await Promise.all([
      fetchCommonData(`account/${id}`),
      fetchCommonData('stats'),
      fetchCommonData(`fts/${id}`),
      fetchCommonData(`account/${id}/inventory`),
      fetchCommonData(`sync/status`),
    ]);

  const spamList: SpamToken = await fetch(
    `https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json`,
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error('Failed to parse spam tokens JSON', error);
      return null;
    });

  const balanceIndexerStatus =
    syncData && syncData?.status?.indexers?.balance?.sync;
  return (
    <AccountOverviewActions
      accountData={accountData?.account?.[0]}
      inventoryData={inventoryData?.inventory}
      spamTokens={spamList}
      statsData={statsData?.stats?.[0]}
      tokenData={tokenDetails?.contracts?.[0]}
      status={balanceIndexerStatus}
    />
  );
}
