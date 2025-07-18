'use client';

import React from 'react';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import Skeleton from '@/components/app/skeleton/common/Skeleton';

interface Props {
  className?: string;
  error?: boolean;
  pageTab?: string;
}

const MTTokenOverviewSkeleton = ({ error }: Props) => {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
        {!error ? (
          <div className="w-80 max-w-xs px-2 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="w-80 max-w-xs py-4 bg-neargray-25 dark:bg-black-300">
            {!error ? <Skeleton className="h-6 flex mt-2" /> : ''}
          </div>
        )}
      </div>

      <div>
        {!error ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
                <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  Overview
                </h2>

                <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Symbol:</div>
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Description:
                    </div>
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Issued At:
                    </div>
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Last Updated:
                    </div>
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
                <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  Profile Summary
                </h2>
                <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                  <div className="flex xl:flex-nowrap md:!flex-nowrap sm:flex-nowrap flex-wrap items-center justify-between sm:divide-x sm:dark:divide-black-200 pt-4 pb-4 gap-y-2">
                    <div className="flex md:items-center xl:gap-x-24 lg:gap-x-12 md:gap-x-28 mr-3 lg:flex-wrap xl:flex-nowrap md:!flex-nowrap sm:flex-wrap flex-wrap justify-between">
                      <div className="w-full mb-1 md:mb-0">Token ID:</div>
                      <div className=" items-center text-center flex lg:ml-[3px]">
                        <div className="w-full break-words">
                          <div className="w-32">
                            <Skeleton className="h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Decimals:
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white soft-shadow rounded-xl dark:bg-black-600">
              <ErrorMessage
                icons={<FaInbox />}
                message={''}
                mutedText="Please try again later"
                reset
              />
            </div>
          </div>
        )}
        <div className="py-6"></div>
      </div>
    </>
  );
};

MTTokenOverviewSkeleton.displayName = 'Overview';
export default MTTokenOverviewSkeleton;
