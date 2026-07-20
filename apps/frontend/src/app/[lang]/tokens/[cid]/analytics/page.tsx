import { redirect } from 'next/navigation';

import { ErrorSuspense } from '@/components/error-suspense';
import { OverviewChart } from '@/components/tokens/analytics/charts';
import {
  fetchFTContractStatsHeatmap,
  fetchFTContractStatsOverview,
} from '@/data/tokens/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/tokens/[cid]/analytics'>;

const AnalyticsOverviewPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, { account }] = await Promise.all([params, searchParams]);

  if (account && typeof account === 'string') {
    redirect(`/tokens/${cid}/analytics/transfers?account=${account}`);
  }

  const overviewPromise = fetchFTContractStatsOverview(cid);
  const heatmapPromise = fetchFTContractStatsHeatmap(cid);
  await holdNav();

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
