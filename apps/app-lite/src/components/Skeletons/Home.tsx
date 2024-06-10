import { useEffect } from 'react';

import { Network } from 'nb-types';

import config from '@/config';

import Skeleton from '../Skeleton';

const HomeSkeleton = ({ onFinish }: { onFinish?: () => void }) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);

  return (
    <div className="relative container mx-auto">
      <div className="py-[58px] px-6">
        <h1 className="font-heading font-bold text-[49px] tracking-[1px]">
          <Skeleton inline loading>
            Hello, I’m the explorer
          </Skeleton>
        </h1>
        <h2 className="font-heading font-medium text-[40px] tracking-[0.4px] mt-[-3px]">
          <Skeleton inline loading>
            If I could talk, this is what I would say to you guys.
          </Skeleton>
        </h2>
      </div>
      <hr className="h-px border-0 border-b border-primary/20" />
      <div className="flex flex-col pt-4 pb-6">
        <div className="h-[280px]" />
      </div>
      <div className="lg:flex flex-wrap justify-between px-3 lg:px-0">
        <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] -mb-[5px]">
              <Skeleton className="w-28" loading>
                &nbsp;
              </Skeleton>
            </p>
            <h3 className="text-[20px] font-normal">
              <Skeleton loading>Transactions</Skeleton>
            </h3>
          </div>
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] -mb-[5px] sm:text-right lg:text-left">
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
              <p className="font-heading font-medium text-[39px] tracking-[0.6px] lg:text-center -mb-[5px]">
                <Skeleton className="w-28" loading>
                  &nbsp;
                </Skeleton>
              </p>
              <h3 className="font-normal text-[20px] lg:text-center">
                <Skeleton loading>Near Price</Skeleton>
              </h3>
            </div>
            <div className="px-3 mb-[42px]">
              <p className="font-heading font-medium text-[39px] tracking-[0.6px] sm:text-right lg:text-center -mb-[5px]">
                <Skeleton className="w-36" loading>
                  &nbsp;
                </Skeleton>
              </p>
              <h3 className="font-normal text-[20px] sm:text-right lg:text-center">
                <Skeleton loading>Market Cap</Skeleton>
              </h3>
            </div>
          </div>
        )}
        <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] lg:text-right -mb-[5px]">
              <Skeleton className="w-44" loading>
                &nbsp;
              </Skeleton>
            </p>
            <h3 className="font-normal text-[20px] lg:text-right">
              <Skeleton loading>Gas Price / Tgas</Skeleton>
            </h3>
          </div>
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] sm:text-right lg:text-right -mb-[5px]">
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
    </div>
  );
};

export default HomeSkeleton;
