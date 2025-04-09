import { getRequest } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

import TxnsTabActions from './TxnsTabActions';
import { processTransactionWithTokens } from '@/utils/near';
import { ApiTxnData } from '@/utils/types';

export default async function TxnsTabs({
  hash,
  searchParams,
}: {
  hash: string;
  locale: string;
  searchParams: any;
}) {
  const options: RequestInit = { next: { revalidate: 10 } };
  const data = (await getRequest(`v1/txns/${hash}/full`)) || {};
  const stats = (await getRequest(`v1/stats`, {}, options)) || [];
  const syncData = (await getRequest(`v1/sync/status`, {}, options)) || [];
  const receipt =
    (await getRequest(`v2/txns/${hash}/receipts`, {}, options)) || [];
  const txn = data?.txns?.[0];
  let price: null | number = null;
  if (txn?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData =
        (await getRequest(`v1/stats/price?date=${blockDt}`, {}, options)) || {};
      price = priceData?.stats?.[0]?.near_price || null;
    }
  }

  let isContract = null;
  if (txn?.receiver_account_id) {
    const [contractResult] = await Promise.allSettled([
      getRequest(`v1/account/${txn?.receiver_account_id}`),
    ]);

    isContract =
      contractResult.status === 'fulfilled' ? contractResult.value : null;
  }

  const tab = searchParams?.tab || 'overview';

  const balanceIndexerStatus =
    syncData && syncData?.status?.indexers?.base?.sync;
  const txnData: ApiTxnData = await processTransactionWithTokens(txn, receipt);
  return (
    <TxnsTabActions
      hash={hash}
      isContract={isContract}
      price={price}
      stats={stats}
      tab={tab}
      txn={txn}
      status={balanceIndexerStatus}
      apiTxnActionsData={txnData}
    />
  );
}
