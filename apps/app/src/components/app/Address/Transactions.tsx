import { getRequestBeta } from '@/utils/app/api';

import TransactionActions from '@/components/app/Address/TransactionActions';

const Transactions = async ({ id, searchParams }: any) => {
  const data = getRequestBeta(`v3/accounts/${id}/txns`, searchParams);
  const count = getRequestBeta(`v3/accounts/${id}/txns/count`, searchParams);
  return <TransactionActions dataPromise={data} countPromise={count} />;
};
export default Transactions;
