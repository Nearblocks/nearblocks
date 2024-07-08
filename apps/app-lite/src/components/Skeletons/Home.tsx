import { useEffect } from 'react';

import { Network } from 'nb-types';

import Skeleton from '@/components/Skeleton';
import config from '@/config';
import { SkeletonProps } from '@/types/types';

export const HomeChartSkeleton = () => (
  <div className="flex flex-col pt-4 pb-6">
    <div className="h-[280px]" />
  </div>
);

export const HomeStatsSkeleton = () => (
  <div className="lg:flex flex-wrap justify-between px-3 lg:px-0">
    <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
      <div className="px-3 mb-[42px]">
        <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] -mb-[5px]">
          <Skeleton className="w-28" loading>
            &nbsp;
          </Skeleton>
        </p>
        <h3 className="text-[20px] font-normal">
          <Skeleton loading>Transactions</Skeleton>
        </h3>
      </div>
      <div className="px-3 mb-[42px]">
        <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] -mb-[5px] sm:text-right lg:text-left">
          <Skeleton className="w-16" loading>
            &nbsp;
          </Skeleton>
        </p>
        <h3 className="text-[20px] font-normal sm:text-right lg:text-left">
          <Skeleton loading>Active Validators</Skeleton>
        </h3>
      </div>
    </div>
    {config.network === Network.MAINNET && (
      <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] -mb-[5px]">
            <Skeleton className="w-28" loading>
              &nbsp;
            </Skeleton>
          </p>
          <h3 className="font-normal text-[20px]">
            <Skeleton loading>Near Price</Skeleton>
          </h3>
        </div>
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] sm:text-right lg:text-left -mb-[5px]">
            <Skeleton className="w-36" loading>
              &nbsp;
            </Skeleton>
          </p>
          <h3 className="font-normal text-[20px] sm:text-right lg:text-left">
            <Skeleton loading>Market Cap</Skeleton>
          </h3>
        </div>
      </div>
    )}
    <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
      <div className="px-3 mb-[42px]">
        <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] lg:text-right -mb-[5px]">
          <Skeleton className="w-44" loading>
            &nbsp;
          </Skeleton>
        </p>
        <h3 className="font-normal text-[20px] lg:text-right">
          <Skeleton loading>Gas Price / Tgas</Skeleton>
        </h3>
      </div>
      <div className="px-3 mb-[42px]">
        <p className="font-heading font-medium text-[32px] lg:text-[38px] tracking-[0.6px] sm:text-right lg:text-right -mb-[5px]">
          <Skeleton className="w-36" loading>
            &nbsp;
          </Skeleton>
        </p>
        <h3 className="font-normal text-[20px] sm:text-right lg:text-right">
          <Skeleton loading>Avg. Block Time</Skeleton>
        </h3>
      </div>
    </div>
  </div>
);

export const HomeSkeleton = () => (
  <div className="relative container mx-auto">
    <div className="flex items-center px-4 py-6 sm:px-6">
      <Skeleton className="w-full h-16" loading>
        <></>
      </Skeleton>
      <hr className="h-px border-0 border-b border-primary/20" />
    </div>
    <div className="py-[58px] px-6 items-center">
      <h1 className="font-heading font-bold text-[40px] lg:text-[48px] tracking-[1px]">
        <Skeleton inline loading>
          Hello, I’m the Near stateless explorer
        </Skeleton>
      </h1>
      <h2 className="font-heading font-medium text-[32px] lg:text-[40px] tracking-[0.4px] mt-[-3px]">
        <Skeleton inline loading>
          With me, you can check real-time data on the NEAR blockchain.
        </Skeleton>
      </h2>
    </div>
    <div className="flex items-center justify-center w-full">
      <div className="lg:w-1/2 flex items-center justify-center">
        <Skeleton className="w-full h-16" loading>
          <></>
        </Skeleton>
      </div>
    </div>
  </div>
);

const HomeSkeletonWrapper = ({ onFinish }: SkeletonProps) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);

  return <HomeSkeleton />;
};

export default HomeSkeletonWrapper;
