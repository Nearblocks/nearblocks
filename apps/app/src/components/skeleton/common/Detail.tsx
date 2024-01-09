import React from 'react';
import Skeleton from './Skeleton';

const Detail = () => {
  return (
    <>
      <div className="text-gray-400 text-xs px-2 mb-4"></div>
      <div>
        <div className="md:flex items-center justify-between">
          <Skeleton className="h-7" />
          <div className="flex items-center flex-shrink-0 max-w-full px-2 space-x-2 pt-4"></div>
        </div>
        <div className="text-gray-500 px-2 pb-5 pt-1"></div>
      </div>
      <div className="bg-white text-sm text-gray-500 divide-solid divide-gray-200 divide-y soft-shadow rounded-lg">
        <div className="flex flex-wrap p-4 text-red-500"></div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-20" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xl" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-sm" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>

          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>

        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-lg" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Detail;
