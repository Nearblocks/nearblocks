'use client';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import TransactionHeatmapSkeleton from './Heatmap';

const AnalyticsOverviewSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="border border-slate-200 dark:border-black-200 rounded-lg p-5 flex flex-col w-full"
          >
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-4 h-4" />
            </div>

            <div className="flex flex-col gap-1">
              <Skeleton className="w-20 h-6" />
              <Skeleton className="w-28 h-4" />
            </div>
          </div>
        ))}
      </div>

      <TransactionHeatmapSkeleton />
    </>
  );
};

export default AnalyticsOverviewSkeleton;
