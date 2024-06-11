import { useEffect } from 'react';

import Skeleton from '../Skeleton';

const BlockSkeleton = ({ onFinish }: { onFinish?: () => void }) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton className="h-[54px] w-56" loading>
          <h1 className="flex items-center font-heading font-medium text-[36px] tracking-[0.1px] mr-4">
            &nbsp;
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Hash</h2>
          <Skeleton className="h-[39px] w-48" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Time</h2>
          <Skeleton className="h-[39px] w-60" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Author</h2>
          <Skeleton className="h-[39px] w-52" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Used</h2>
          <Skeleton className="h-[39px] w-32" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Price</h2>
          <Skeleton className="h-[39px] w-48" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Limit</h2>
          <Skeleton className="h-[39px] w-36" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Fee</h2>
          <Skeleton className="h-[39px] w-36" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Shards</h2>
          <Skeleton className="h-[39px] w-10" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Parent Hash</h2>
          <Skeleton className="h-[39px] w-48" loading>
            <p className="font-heading font-medium text-[22px]">&nbsp;</p>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default BlockSkeleton;
