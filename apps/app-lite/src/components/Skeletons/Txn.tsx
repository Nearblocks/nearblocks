import { useEffect } from 'react';

import Skeleton from '@/components/Skeleton';
import { SkeletonProps } from '@/types/types';

export const TxnAddressSkeleton = () => (
  <div className="flex items-center pb-3">
    <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3"></span>
    <Skeleton className="block h-5 w-28" loading>
      <span className="font-heading font-semibold text-sm">&nbsp;</span>
    </Skeleton>
  </div>
);

export const TxnActionSkeleton = () => (
  <Skeleton className="block h-7 w-28" loading>
    <button className="text-sm text-black rounded py-1 px-3 bg-bg-function">
      &nbsp;
    </button>
  </Skeleton>
);

export const TxnReceiptSkeleton = () => (
  <>
    <TxnAddressSkeleton />
    <div className="relative ml-2 mb-3 py-3 px-4">
      <div className="arrow absolute h-full left-0 top-0 border-l border-border-body"></div>
      <div className="space-y-2">
        <div>
          <div>
            <TxnActionSkeleton />
            <span className="font-semibold text-xs" />
          </div>
        </div>
      </div>
    </div>
    <TxnAddressSkeleton />
  </>
);

export const TxnExecutionSkeleton = () => (
  <div>
    <div className="flex justify-between items-center text-sm mb-6">
      <Skeleton className="block h-5 w-40" loading>
        <span className="text-text-label">&nbsp;</span>
      </Skeleton>
    </div>
    <TxnReceiptSkeleton />
  </div>
);

export const TxnTabsSkeleton = () => (
  <div className="bg-bg-box lg:rounded-xl shadow px-6 mt-8">
    <div className="pt-4 pb-6">
      <button className="py-1 mr-4 font-medium border-b-[3px] border-text-body">
        Execution Plan
      </button>
    </div>
    <div className="lg:px-4 pb-6">
      <TxnExecutionSkeleton />
    </div>
  </div>
);

export const TxnSkeleton = () => (
  <div className="relative container mx-auto">
    <div className="pt-7 pb-[26px] px-5">
      <Skeleton className="block h-[48px] lg:h-[54px] w-[300px]" loading>
        <h1 className="flex items-center font-heading font-medium text-[32px]lg:text-[36px] tracking-[0.1px] mr-4">
          &nbsp;
        </h1>
      </Skeleton>
    </div>
    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">From</h2>
        <Skeleton className="block h-[39px] w-[200px]" loading>
          <div className="font-heading font-medium text-[26px]">&nbsp;</div>
        </Skeleton>
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">To</h2>
        <Skeleton className="block h-[39px] w-[200px]" loading>
          <div className="font-heading font-medium text-[26px]">&nbsp;</div>
        </Skeleton>
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">Block</h2>
        <Skeleton className="block h-[39px] w-32" loading>
          <div className="font-heading font-medium text-[26px]">&nbsp;</div>
        </Skeleton>
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">Time (UTC)</h2>
        <Skeleton className="block h-[39px] w-[280px]" loading>
          <div className="font-heading font-medium text-[24px]">&nbsp;</div>
        </Skeleton>
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">Amount</h2>
        <Skeleton className="block h-[39px] w-28" loading>
          <div className="font-heading font-medium text-[24px]">&nbsp;</div>
        </Skeleton>
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
        <h2 className="font-medium text-sm mb-0.5">Fee</h2>
        <Skeleton className="block h-[39px] w-[140px]" loading>
          <div className="font-heading font-medium text-[24px]">&nbsp;</div>
        </Skeleton>
      </div>
    </div>
    <TxnTabsSkeleton />
  </div>
);

const TxnSkeletonWrapper = ({ onFinish }: SkeletonProps) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);

  return <TxnSkeleton />;
};

export default TxnSkeletonWrapper;
