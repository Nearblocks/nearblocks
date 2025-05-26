import { getRequest } from '@/utils/app/api';

import ReceiptActions from '@/components/app/Address/ReceiptActions';

const Receipts = async ({ id, searchParams }: any) => {
  const data = getRequest(`v2/account/${id}/receipts`, searchParams);
  const count = getRequest(`v2/account/${id}/receipts/count`, searchParams);

  return <ReceiptActions dataPromise={data} countPromise={count} />;
};
export default Receipts;
