import { getRequest } from '@/utils/app/api';
import AccountOverviewActions from '@/components/app/Address/AccountOverviewActions';
import {
  intentsTokenPricesApiUrl,
  refFinanceTokenPricesApiUrl,
} from '@/utils/app/config';

export default async function AccountOverview({ id }: any) {
  const accountData = getRequest(`v1/account/${id}`);
  const tokenData = getRequest(`v1/fts/${id}`);
  const inventoryData = getRequest(`v1/account/${id}/inventory`);
  const mtsData = getRequest(`v2/account/${id}/inventory/mts`);
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
      accountDataPromise={accountData}
      inventoryDataPromise={inventoryData}
      mtsDataPromise={mtsData}
      spamTokensPromise={spamList}
      tokenDataPromise={tokenData}
      intentsTokenPricesPromise={intentsTokenPrices}
      refTokenPricesPromise={refTokenPrices}
    />
  );
}
