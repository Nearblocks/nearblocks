import { getRequest } from '@/utils/app/api';

import TransactionActions from './TransactionActions';

const Transactions = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/txns-only`, searchParams),
    getRequest(`account/${id}/txns-only/count`, searchParams),
  ]);

  return (
    <>
      <TransactionActions
        count={count?.txns?.[0]?.count}
        cursor={data?.cursor}
        error={!data || data === null}
        id={id}
        txns={data?.txns}
      />
    </>
  );
};
export default Transactions;
