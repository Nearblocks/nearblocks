import { getRequest, getRequestBeta } from '@/utils/app/api';
import AccountOverviewActions from '@/components/app/Address/AccountOverviewActions';
import {
  intentsTokenPricesApiUrl,
  refFinanceTokenPricesApiUrl,
} from '@/utils/app/config';

export default async function AccountOverview({ id }: any) {
  const accountBalance = getRequestBeta(`v3/accounts/${id}/balance`);
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
  const intentsTokenPrices = intentsTokenPricesApiUrl
    ? getRequest(
        intentsTokenPricesApiUrl,
        {},
        { next: { revalidate: 90 } },
        false,
      )
    : Promise.resolve([]);
  const refTokenPrices = refFinanceTokenPricesApiUrl
    ? getRequest(
        refFinanceTokenPricesApiUrl,
        {},
        { next: { revalidate: 90 } },
        false,
      )
    : Promise.resolve([]);

  return (
    <AccountOverviewActions
      accountBalancePromise={accountBalance}
      inventoryDataPromise={inventoryData}
      mtsDataPromise={mtsData}
      spamTokensPromise={spamList}
      statsDataPromise={statsData}
      tokenDataPromise={tokenData}
      syncDataPromise={syncData}
      intentsTokenPricesPromise={intentsTokenPrices}
      refTokenPricesPromise={refTokenPrices}
    />
  );
}
