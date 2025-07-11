import { getRequest } from '@/utils/app/api';

import Overview from '@/components/app/Transactions/Overview';

export default async function HomeOverview({ theme }: { theme: any }) {
  const statsDetails = await getRequest('v1/stats', {});
  const charts = await getRequest('v1/charts/latest');
  const stats = statsDetails?.stats?.[0];

  if (
    statsDetails?.message === 'Error' ||
    charts?.message === 'Error' ||
    stats?.message === 'Error'
  ) {
    throw new Error(`Server Error`);
  }
  return (
    <div className="relative -mt-14 ">
      <Overview
        chartsDetails={charts}
        error={!stats}
        stats={stats}
        theme={theme}
      />
    </div>
  );
}
