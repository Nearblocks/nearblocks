import { TxnsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const TxnsPage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Daily Transactions Chart</h1>
      <ErrorSuspense fallback={<TxnsChart loading />}>
        <TxnsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnsPage;
