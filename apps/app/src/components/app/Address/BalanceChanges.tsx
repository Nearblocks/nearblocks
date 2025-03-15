import { getRequest } from '@/utils/app/api';
import BalanceChangeActions from './BalanceChangeActions';
const BalanceChanges = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/activities`, searchParams, options),
    getRequest(`account/${id}/activities/count`, searchParams, options),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <BalanceChangeActions
      count={count?.activities?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      activities={data?.activities}
    />
  );
};
export default BalanceChanges;
