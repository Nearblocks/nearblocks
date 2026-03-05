import { TxnFeeChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const TxnFeePage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Transaction Fee Chart</h1>
      <ErrorSuspense fallback={<TxnFeeChart loading />}>
        <TxnFeeChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnFeePage;
