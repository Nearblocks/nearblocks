import { BlocksChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const BlocksChartPage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Block Count Chart</h1>
      <ErrorSuspense fallback={<BlocksChart loading />}>
        <BlocksChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default BlocksChartPage;
