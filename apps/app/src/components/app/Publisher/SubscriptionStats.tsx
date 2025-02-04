import React from 'react';

import useAuth from '@/hooks/app/useAuth';
import { localFormat } from '@/utils/app/libs';

import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  type?: string;
}

const SubscriptionStats = ({ type }: Props) => {
  const apiUrl =
    type === 'api'
      ? '/publisher/subscriptions/stats/api'
      : '/publisher/subscriptions/stats/campaigns';

  const { data, loading } = useAuth(apiUrl);

  return (
    <>
      {
        <div className="bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl p-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
            <div className="flex flex-col md:items-center items-start justify-start ">
              <div className="m-2 p-2  md:border-r dark:border-black-200 w-full ">
                <h2 className="text-lg text-gray-500 dark:text-neargray-10 font-semibold">
                  {'Active'}
                </h2>
                {!loading && data ? (
                  <>
                    <p className="text-3xl text-nearblue-600 font-semibold dark:text-neargray-10">
                      {localFormat(data?.active)}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="w-1/2 h-6" />
                    <Skeleton className="mt-3" />
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col md:items-center items-start justify-start ">
              <div className="m-2 p-2 w-full  md:border-r">
                <h2 className="text-lg text-gray-500 dark:text-neargray-10 font-semibold">
                  {'Incomplete'}
                </h2>
                {!loading && data ? (
                  <>
                    <p className=" text-3xl font-semibold text-nearblue-600 dark:text-neargray-10">
                      {localFormat(data?.incomplete)}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="w-1/2 h-6" />
                    <Skeleton className="mt-3" />
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col md:items-center items-start justify-start">
              <div className="m-2 p-2 w-full">
                <h2 className="text-lg text-gray-500 dark:text-neargray-10 font-semibold">
                  {'Cancelled'}
                </h2>
                {!loading && data ? (
                  <>
                    <p className=" text-3xl font-semibold text-nearblue-600 dark:text-neargray-10">
                      {localFormat(data?.cancelled)}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="w-1/2 h-6" />
                    <Skeleton className="mt-3" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default SubscriptionStats;
