import React from 'react';
import List from '../common/List';
import Skeleton from '../common/Skeleton';

const Index = () => {
  return (
    <div className="absolute w-full">
      <div className="flex flex-col md:flex-row gap-4 ">
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <div>
              <h2 className=" flex justify-between border-b p-3 text-gray-600 text-sm font-semibold">
                <span>Staking Overview</span>
              </h2>
            </div>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex  py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Current Validators
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex  py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Total Staked
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex max-md:divide-y  flex-col md:flex-row ">
                <div className="flex w-full md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Current Seat Price</div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-16 break-words" />
                  </div>
                </div>
                <div className="flex w-full md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Total Supply</div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-16 break-words" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
              Epoch Information
            </h2>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Epoch Elapsed Time:
                </div>
                <div className="w-full text-green-500 md:w-3/4 break-words">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA:</div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Progress</div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-5"></div>
      <div className="relative w-full mb-10">
        <List />
      </div>
    </div>
  );
};

export default Index;
