import { PriceChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const NearPricePage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Daily Price (USD) Chart</h1>
      <ErrorSuspense fallback={<PriceChart loading />}>
        <PriceChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default NearPricePage;
