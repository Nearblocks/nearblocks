import { TxnVolumeChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const TxnVolumePage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Transaction Volume Chart</h1>
      <ErrorSuspense fallback={<TxnVolumeChart loading />}>
        <TxnVolumeChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnVolumePage;
