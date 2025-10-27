import { getRequest, getRequestBeta } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

import TxnsTabActions from '@/components/app/Transactions/TxnsTabActions';
import { processTransactionWithTokens } from '@/utils/near';
import { ApiTxnData } from '@/utils/types';
import { isEmpty } from 'lodash';
import { Txn, TxnFT, TxnNFT, TxnReceipts } from 'nb-schemas';

export default async function TxnsTabs({
  hash,
  searchParams,
}: {
  hash: string;
  locale: string;
  searchParams: any;
}) {
  const options: RequestInit = { next: { revalidate: 10 } };
  const requestOptions: RequestInit = {
    cache: 'force-cache',
    next: { tags: [`txn-${hash}`] },
  };

  const stats = (await getRequest(`v1/stats`, {}, options)) || [];
  const { data: txn }: { data: Txn } =
    (await getRequestBeta(`v3/txns/${hash}`, {}, requestOptions)) || {};
  const { data: receipt }: { data: TxnReceipts } =
    (await getRequestBeta(`v3/txns/${hash}/receipts`, {}, options)) || [];
  const { data: txnFTs }: { data: TxnFT[] } =
    (await getRequestBeta(`v3/txns/${hash}/nfts`, {}, requestOptions)) || {};
  const { data: txnNFTs }: { data: TxnNFT[] } =
    (await getRequestBeta(`v3/txns/${hash}/fts`, {}, requestOptions)) || {};

  let hasReceipts = true;

  if (isEmpty(receipt)) {
    const receiptIndexerHealth =
      (await getRequest('v1/health/indexer-receipts')) || {};
    if (!receiptIndexerHealth?.height) {
      hasReceipts = false;
    } else if (
      txn?.block?.block_height &&
      receiptIndexerHealth?.height &&
      txn?.block?.block_height > receiptIndexerHealth?.height
    ) {
      hasReceipts = false;
    }
  }

  let price: null | number = null;
  if (txn?.block?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn?.block?.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData =
        (await getRequest(`v1/stats/price?date=${blockDt}`, {}, options)) || {};
      price = priceData?.stats?.[0]?.near_price || null;
    }
  }

  const tab = searchParams?.tab || 'overview';

  const txnData: ApiTxnData = await processTransactionWithTokens(txn, receipt);
  return (
    <TxnsTabActions
      hash={hash}
      price={price}
      stats={stats}
      tab={tab}
      txn={txn}
      receipt={receipt}
      txnFTs={txnFTs}
      txnNFTs={txnNFTs}
      apiTxnActionsData={txnData}
      hasReceipts={hasReceipts}
    />
  );
}
