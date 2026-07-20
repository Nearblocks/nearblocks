import Overview from '@/components/address/analytics/overview';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchStatsOverview, fetchTxnsHeatmap } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics'>;

const AnalyticsPage = async ({ params }: Props) => {
  const { address } = await params;
  const overviewPromise = fetchStatsOverview(address);
  const heatmapPromise = fetchTxnsHeatmap(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<Overview loading />}>
      <Overview
        heatmapPromise={heatmapPromise}
        overviewPromise={overviewPromise}
      />
    </ErrorSuspense>
  );
};

export default AnalyticsPage;
