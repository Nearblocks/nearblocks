import { getRequestBeta } from '@/utils/app/api';

import ReceiptActions from '@/components/app/Address/ReceiptActions';

const Receipts = async ({ id, searchParams }: any) => {
  const data = getRequestBeta(`v3/accounts/${id}/receipts`, searchParams);
  const count = getRequestBeta(
    `v3/accounts/${id}/receipts/count`,
    searchParams,
  );
  return <ReceiptActions dataPromise={data} countPromise={count} />;
};
export default Receipts;
