import React from 'react';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
interface Props {
  error?: boolean;
}
const OverViewSkelton = ({ error }: Props) => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
        <div className="w-80 max-w-xs py-4 mb-2 mt-2.5 bg-neargray-25 dark:bg-black-300">
          {!error ? <Skeleton className="h-6 flex" /> : ''}
        </div>
      </div>
      {!error ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mb-0.5">
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                <div className="py-.5 text-sm font-semibold">
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-5 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-5 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                <div className="py-.5 text-sm font-semibold">
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>

              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-5 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-5 w-28" />
                  </div>

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="flex flex-wrap py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-56 flex justify-center items-center bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0 dark:bg-black-600">
          <ErrorMessage
            icons={<FaInbox />}
            message={''}
            mutedText="Please try again later"
            reset
          />
        </div>
      )}
      <div className="py-6"></div>
    </>
  );
};

export default OverViewSkelton;
