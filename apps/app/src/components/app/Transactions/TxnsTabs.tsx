import { getRequest } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

import TxnsTabActions from '@/components/app/Transactions/TxnsTabActions';
import { processTransactionWithTokens } from '@/utils/near';
import { ApiTxnData } from '@/utils/types';
import { isEmpty } from 'lodash';

export default async function TxnsTabs({
  hash,
  searchParams,
}: {
  hash: string;
  locale: string;
  searchParams: any;
}) {
  const requestOptions: RequestInit = {
    next: { tags: [`txn-${hash}`] },
  };
  const data = (await getRequest(`v2/txns/${hash}`, {}, requestOptions)) || {};
  const stats = (await getRequest(`v1/stats`)) || [];
  const receipt = (await getRequest(`v2/txns/${hash}/receipts`)) || [];

  let hasReceipts = true;

  // Fallback to RPC when receipt_tree is null/empty
  // This occurs when local_receipts data is missing
  if (isEmpty(receipt?.receipts?.[0]?.receipt_tree)) hasReceipts = false;

  const txn = data?.txns?.[0];
  let price: null | number = null;
  if (txn?.block?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn?.block?.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData =
        (await getRequest(`v1/stats/price?date=${blockDt}`)) || {};
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

  const txnData: ApiTxnData = await processTransactionWithTokens(txn, receipt);
  return (
    <TxnsTabActions
      hash={hash}
      isContract={isContract}
      price={price}
      stats={stats}
      tab={tab}
      txn={txn}
      apiTxnActionsData={txnData}
      hasReceipts={hasReceipts}
    />
  );
}
