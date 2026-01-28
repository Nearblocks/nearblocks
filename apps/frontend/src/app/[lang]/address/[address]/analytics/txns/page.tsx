import { TxnsChart } from '@/components/address/analytics/txns';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchTxnStats } from '@/data/address/analytics';

type Props = PageProps<'/[lang]/address/[address]/analytics/balance'>;

const TxnsPage = async ({ params }: Props) => {
  const { address } = await params;
  const txnsPromise = fetchTxnStats(address);

  return (
    <ErrorSuspense fallback={<TxnsChart loading={true} />}>
      <TxnsChart txnsPromise={txnsPromise} />
    </ErrorSuspense>
  );
};

export default TxnsPage;
