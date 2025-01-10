import { getRequest } from '@/utils/app/api';

import Overview from '../Transactions/Overview';

export default async function HomeOverview({ theme }: { theme: any }) {
  const statsDetails = await getRequest('stats', {});
  const charts = await getRequest('charts/latest');

  const stats = statsDetails?.stats?.[0];
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
