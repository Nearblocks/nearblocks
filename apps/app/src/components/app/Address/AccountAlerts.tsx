import { getRequest } from '@/utils/app/api';
import AccountAlertsActions from './AccountAlertsActions';

export default async function AccountAlerts({ id }: { id: string }) {
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

  const accountData = await fetchCommonData(`account/${id}`);

  return <AccountAlertsActions accountData={accountData} />;
}
