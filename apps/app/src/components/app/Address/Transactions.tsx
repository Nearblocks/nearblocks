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
        id={id}
        txns={data?.txns}
        count={count?.txns?.[0]?.count}
        error={!data || data === null}
        cursor={data?.cursor}
      />
    </>
  );
};
export default Transactions;
