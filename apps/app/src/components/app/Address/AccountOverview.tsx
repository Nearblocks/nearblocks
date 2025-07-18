import { getRequest } from '@/utils/app/api';
import AccountOverviewActions from '@/components/app/Address/AccountOverviewActions';

export default async function AccountOverview({ id }: any) {
  const accountData = getRequest(`v1/account/${id}`);
  const statsData = getRequest('v1/stats');
  const tokenData = getRequest(`v1/fts/${id}`);
  const inventoryData = getRequest(`v1/account/${id}/inventory`);
  const mtsData = getRequest(`v2/account/${id}/inventory/mts`);
  const syncData = getRequest(`v1/sync/status`);
  const spamList = getRequest(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
    {},
    {},
    false,
  );

  return (
    <AccountOverviewActions
      accountDataPromise={accountData}
      inventoryDataPromise={inventoryData}
      mtsDataPromise={mtsData}
      spamTokensPromise={spamList}
      statsDataPromise={statsData}
      tokenDataPromise={tokenData}
      syncDataPromise={syncData}
    />
  );
}
