import { getRequest } from '@/utils/app/api';

import ReceiptActions from './ReceiptActions';

const Receipts = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`v2/account/${id}/receipts`, searchParams, options),
    getRequest(`v2/account/${id}/receipts/count`, searchParams, options),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <ReceiptActions
      count={count?.txns?.[0]?.count}
      cursor={data?.cursor}
      error={!data || data === null}
      txns={data?.txns}
    />
  );
};
export default Receipts;
