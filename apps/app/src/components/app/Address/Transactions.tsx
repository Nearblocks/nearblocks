import { getRequest } from '@/utils/app/api';

import TransactionActions from '@/components/app/Address/TransactionActions';

const Transactions = async ({ id, searchParams }: any) => {
  const data = getRequest(`v1/account/${id}/txns-only`, searchParams);
  const count = getRequest(`v1/account/${id}/txns-only/count`, searchParams);

  return <TransactionActions dataPromise={data} countPromise={count} />;
};
export default Transactions;
