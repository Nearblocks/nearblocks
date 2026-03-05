import { MarketCapChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const MarketCapPage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">
        Near Market Capitalization Chart
      </h1>
      <ErrorSuspense fallback={<MarketCapChart loading />}>
        <MarketCapChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default MarketCapPage;
