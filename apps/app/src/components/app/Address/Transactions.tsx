import { getRequest } from '@/utils/app/api';

import TransactionActions from '@/components/app/Address/TransactionActions';

const Transactions = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };

  const [data, count] = await Promise.all([
    getRequest(`v1/account/${id}/txns-only`, searchParams, options),
    getRequest(`v1/account/${id}/txns-only/count`, searchParams, options),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <TransactionActions
      count={count?.txns?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      txns={data?.txns}
    />
  );
};
export default Transactions;
