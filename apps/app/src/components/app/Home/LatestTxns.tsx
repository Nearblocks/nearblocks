import { getRequest } from '@/utils/app/api';

import LatestTransactions from '@/components/app/Transactions/Latest';

export default async function HomeLatestTxns() {
  const txnsDetails = await getRequest('v1/txns/latest');

  const txns = txnsDetails?.txns || [];

  if (txnsDetails.message === 'Error') {
    throw new Error(`Server Error : ${txnsDetails.error}`);
  }

  return (
    <div className="relative ">
      <LatestTransactions error={!txns} txns={txns} />
    </div>
  );
}
