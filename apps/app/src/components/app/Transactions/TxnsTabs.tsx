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
  const data = (await getRequest(`txns/${hash}`)) || {};
  const stats = (await getRequest(`stats`)) || [];
  const txn = data?.txns?.[0];
  let price: number | null = null;
  if (txn?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData = (await getRequest(`stats/price?date=${blockDt}`)) || {};
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
      tab={tab}
      txn={txn}
      stats={stats}
      isContract={isContract}
      price={price}
      hash={hash}
    />
  );
}
