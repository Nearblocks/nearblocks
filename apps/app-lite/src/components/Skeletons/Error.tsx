import { useEffect } from 'react';

import Skeleton from '@/components/Skeleton';
import { SkeletonProps } from '@/types/types';

export const ErrorIconSkeleton = () => {
  return <Skeleton className="w-12 h-12 !rounded-full mb-2" loading />;
};

export const ErrorSkeleton = () => {
  return (
    <div className="relative container mx-auto">
      <div className="flex flex-col items-center py-10 px-5">
        <ErrorIconSkeleton />
        <h1 className="font-heading font-medium text-xl text-center tracking-[0.1px]">
          <Skeleton className="w-52" loading>
            &nbsp;
          </Skeleton>
        </h1>
        <p className="text-text-label text-sm text-center mt-1">
          <Skeleton className="w-80" loading>
            &nbsp;
          </Skeleton>
        </p>
      </div>
    </div>
  );
};

const ErrorSkeletonWrapper = ({ onFinish }: SkeletonProps) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);

  return <ErrorSkeleton />;
};

export default ErrorSkeletonWrapper;
