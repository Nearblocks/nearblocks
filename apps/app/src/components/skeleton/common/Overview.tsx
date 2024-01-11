import React from 'react';
import Skeleton from './Skeleton';
import List from './List';
const Overview = () => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4">
        <Skeleton className="h-4 flex w-full px-2 py-4" />
        <div className="flex items-center flex-shrink-0 max-w-full px-2 space-x-2 pt-4"></div>
      </div>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
              <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
                <Skeleton className="h-4 w-32" />
              </h2>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 "></div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 "></div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0"></div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
              <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
                <Skeleton className="h-4 w-32" />
              </h2>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 "></div>
                  <div className="w-full md:w-3/4 break-words">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 "></div>
                  <div className="w-full md:w-3/4 text-green-500 break-words">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 "></div>
                  <div className="w-full md:w-3/4 break-words">
                    {/* corrections needed */}
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <div className="relative bg-white soft-shadow rounded-lg pb-1">
              <div className={`flex flex-col lg:flex-row pt-4`}>
                <div className="flex flex-col">
                  <p className="leading-7 px-6 text-sm mb-4 text-gray-500"></p>
                </div>
              </div>
              <List showRounded={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Overview;
