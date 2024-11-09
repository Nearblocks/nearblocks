'use client';
import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '../common/Skeleton';

export default function HashLoading() {
  const { networkId } = useConfig();

  return (
    <>
      <div className="md:flex items-center justify-between">
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>
      </div>
      <div className="bg-white text-sm text-nearblue-600 dark:text-neargray-10 dark:bg-black-600 dark:divide-black-200 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
        {networkId === 'testnet' && (
          <div className="flex flex-wrap p-4 text-red-500">
            <Skeleton className="w-1/4 h-6" />
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
      </div>
    </>
  );
}
