import { getRequest } from '@/utils/app/api';
import ReceiptActions from './ReceiptActions';

const Receipts = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/receipts`, searchParams),
    getRequest(`account/${id}/receipts/count`, searchParams),
  ]);

  return (
    <>
      <ReceiptActions
        id={id}
        txns={data?.txns}
        count={count?.txns?.[0]?.count}
        error={!data || data === null}
        cursor={data?.cursor}
      />
    </>
  );
};
export default Receipts;
