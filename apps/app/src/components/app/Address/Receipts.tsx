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
        count={count?.txns?.[0]?.count}
        cursor={data?.cursor}
        error={!data || data === null}
        id={id}
        txns={data?.txns}
      />
    </>
  );
};
export default Receipts;
