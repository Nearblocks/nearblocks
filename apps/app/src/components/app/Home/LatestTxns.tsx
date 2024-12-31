import { getRequest } from '@/utils/app/api';

import LatestTransactions from '../Transactions/Latest';

export default async function HomeLatestTxns() {
  const txnsDetails = await getRequest('txns/latest');

  const txns = txnsDetails?.txns || [];

  return (
    <div className="relative ">
      <LatestTransactions error={!txns} txns={txns} />
    </div>
  );
}
