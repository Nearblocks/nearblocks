'use client';

import Skeleton from '@/components/app/skeleton/common/Skeleton';

const TransactionHeatmapSkeleton = () => {
  return (
    <div className="border dark:border-black-200 rounded-lg my-2 min-h-[300px]">
      <div className="w-full flex justify-between items-center border-b dark:border-b-black-200">
        <span className="text-sm font-semibold dark:text-neargray-10 text-nearblue-600 py-2 px-4">
          Transaction Heatmap
        </span>
        <div className="py-2 px-4">
          <Skeleton className="w-28 sm:!w-48 h-4" />
        </div>
      </div>

      <div className="bg-white dark:bg-black-300 overflow-x-auto">
        <div className="min-w-max px-4 py-6">
          <Skeleton className="w-full h-[200px] rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default TransactionHeatmapSkeleton;
