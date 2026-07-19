import { TxnsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchTxnStats } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics/txns'>;

const TxnsPage = async ({ params }: Props) => {
  const { address } = await params;
  const txnsPromise = fetchTxnStats(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<TxnsChart loading={true} />}>
      <TxnsChart txnsPromise={txnsPromise} />
    </ErrorSuspense>
  );
};

export default TxnsPage;
