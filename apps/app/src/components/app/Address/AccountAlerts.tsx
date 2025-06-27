import { getRequest } from '@/utils/app/api';
import AccountAlertsActions from '@/components/app/Address/AccountAlertsActions';

export default async function AccountAlerts({ id }: { id: string }) {
  const accountData = getRequest(`v1/account/${id}`);

  return <AccountAlertsActions accountDataPromise={accountData} />;
}
