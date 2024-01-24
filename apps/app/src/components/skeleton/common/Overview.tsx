import React from 'react';
import Skeleton from './Skeleton';
import List from './List';

interface OverviewProps {
  border?: boolean;
}

const Overview = ({ border }: OverviewProps) => {
  return (
    <div className="absolute w-full pr-6 z-50">
      <div className="flex items-center justify-between flex-wrap pt-4">
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>{' '}
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>
      </div>
      <div>
        {border ? (
          <>
            <div className="text-gray-500 px-2 pb-5 pt-1 border-t"></div>
            <div className="flex items-center flex-shrink-0 max-w-full px-2 space-x-2 pt-4"></div>
          </>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl">
              <div className="flex justify-between border-b p-3 text-gray-600">
                <h2 className="leading-6 text-sm font-semibold">
                  <Skeleton className="h-4 w-28" />
                </h2>
              </div>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-4 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-4 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="w-full md:w-3/4 break-words -my-1">
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
              <h2 className="leading-6 border-b p-3 text-gray-600 text-sm font-semibold">
                <Skeleton className="h-4 w-28" />
              </h2>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex justify-between">
                  <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">
                      <Skeleton className="h-4 w-28" />
                    </div>

                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full"></div>
                </div>
                <div className="flex justify-between">
                  <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">
                      <Skeleton className="h-4 w-28" />
                    </div>

                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>

                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full" />
                </div>

                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <div className="bg-white soft-shadow rounded-xl pb-1">
              <div>
                <div className=" flex">
                  <div
                    className={`border-b-4 border-green-500 text-green-500 text-sm font-semibol overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>{' '}
                  <div
                    className={`text-gray-600 text-sm font-semibold border-green-500  overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>{' '}
                  <div
                    className={`text-gray-600 text-sm font-semibold border-green-500  overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>{' '}
                  <div
                    className={`text-gray-600 text-sm font-semibold border-green-500  overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>{' '}
                  <div
                    className={`text-gray-600 text-sm font-semibold border-green-500  overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div
                    className={`text-gray-600 text-sm font-semibold border-green-500  overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 `}
                  >
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="relative">
                  <List showRounded={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Overview;
