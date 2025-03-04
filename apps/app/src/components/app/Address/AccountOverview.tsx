import { getRequest } from '@/utils/app/api';
import AccountOverviewActions from './AccountOverviewActions';
import { SpamToken } from '@/utils/types';

export default async function AccountOverview({ id }: any) {
  const options: RequestInit = { next: { revalidate: 10 } };

  const [accountData, statsData, tokenDetails, inventoryData, syncData] =
    await Promise.all([
      getRequest(`account/${id}`, {}, options),
      getRequest('stats', {}, options),
      getRequest(`fts/${id}`, {}, options),
      getRequest(`account/${id}/inventory`, {}, options),
      getRequest(`sync/status`, {}, options),
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
