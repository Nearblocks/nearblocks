import { getRequest } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

import TxnsTabActions from './TxnsTabActions';

export default async function TxnsTabs({
  hash,
  searchParams,
}: {
  hash: string;
  locale: string;
  searchParams: any;
}) {
  const options: RequestInit = { next: { revalidate: 10 } };
  const data = (await getRequest(`txns/${hash}`, {}, options)) || {};
  const stats = (await getRequest(`stats`, {}, options)) || [];
  const txn = data?.txns?.[0];
  let price: null | number = null;
  if (txn?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData =
        (await getRequest(`stats/price?date=${blockDt}`, {}, options)) || {};
      price = priceData?.stats?.[0]?.near_price || null;
    }
  }

  let isContract = null;
  if (txn?.receiver_account_id) {
    const [contractResult] = await Promise.allSettled([
      getRequest(`account/${txn?.receiver_account_id}`),
    ]);

    isContract =
      contractResult.status === 'fulfilled' ? contractResult.value : null;
  }

  const tab = searchParams?.tab || 'overview';

  return (
    <TxnsTabActions
      hash={hash}
      isContract={isContract}
      price={price}
      stats={stats}
      tab={tab}
      txn={txn}
    />
  );
}
