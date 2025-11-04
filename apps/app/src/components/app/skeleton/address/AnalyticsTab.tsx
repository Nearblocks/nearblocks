import Skeleton from '@/components/app/skeleton/common/Skeleton';
import AnalyticsOverviewSkeleton from './AnalyticsOverview';

const AnalyticsTabSkeltton = () => {
  const tabs = [
    'Overview',
    'Balance',
    'Transactions',
    'Txns Fees',
    'Token Transfers',
  ];

  return (
    <div className="pb-1 px-4 py-2.5">
      <div className="flex flex-wrap gap-x-1 gap-y-2 pt-2">
        {tabs.map((index) => (
          <Skeleton key={index} className="px-4 py-1.5 h-8 w-24 rounded-lg" />
        ))}
      </div>

      <div className="mt-4">
        <AnalyticsOverviewSkeleton />
      </div>
    </div>
  );
};

export default AnalyticsTabSkeltton;
