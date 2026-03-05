import { SupplyChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const NearSupplyPage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Supply Growth Chart</h1>
      <ErrorSuspense fallback={<SupplyChart loading />}>
        <SupplyChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default NearSupplyPage;
