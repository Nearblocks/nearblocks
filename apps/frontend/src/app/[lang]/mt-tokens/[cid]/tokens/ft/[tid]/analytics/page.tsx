import { ErrorSuspense } from '@/components/error-suspense';
import { OverviewChart } from '@/components/mt-tokens/analytics/charts';
import {
  fetchMTTokenStatsHeatmap,
  fetchMTTokenStatsOverview,
} from '@/data/mt-tokens/analytics';

type Props = PageProps<'/[lang]/mt-tokens/[cid]/tokens/ft/[tid]/analytics'>;

const AnalyticsOverviewPage = async ({ params }: Props) => {
  const { cid, tid } = await params;

  const overviewPromise = fetchMTTokenStatsOverview(cid, tid);
  const heatmapPromise = fetchMTTokenStatsHeatmap(cid, tid);

  return (
    <ErrorSuspense fallback={<OverviewChart loading />}>
      <OverviewChart
        heatmapPromise={heatmapPromise}
        overviewPromise={overviewPromise}
      />
    </ErrorSuspense>
  );
};

export default AnalyticsOverviewPage;
