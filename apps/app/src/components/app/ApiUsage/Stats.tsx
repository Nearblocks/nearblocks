'use client';
import React, { useMemo } from 'react';

import useAuth from '@/hooks/app/useAuth';
import { localFormat } from '@/utils/app/libs';

import Skeleton from '../skeleton/common/Skeleton';
interface Props {
  keyId?: string | string[];
}

const ApiUsageStats = ({ keyId }: Props) => {
  const { data, loading } = useAuth('keys/stats');
  const apiUrl = keyId ? `keys/${keyId}/stats` : '';
  const { data: keyData, loading: keyDataLoading } = useAuth(apiUrl);
  const rateLimit = useMemo(() => {
    const limit = data?.monthLimit ? data?.monthLimit : 0;
    const dayLimit = data?.dayLimit ? data?.dayLimit : 0;
    const consumed = data?.consumed ? data?.consumed : 0;
    const minuteLimit = data?.minuteLimit ? data?.minuteLimit : 0;
    const consumedDaily = data?.consumedDaily ? data?.consumedDaily : 0;

    const adjustedConsumed = Math.min(consumed, limit);
    const adjustedConsumedDaily = Math.min(consumedDaily, dayLimit);

    const percentage = limit === 0 ? 0 : (adjustedConsumed / limit) * 100;
    const dailyPercentage =
      dayLimit === 0 ? 0 : (adjustedConsumedDaily / dayLimit) * 100;

    return {
      consumed: adjustedConsumed,
      consumedDaily: adjustedConsumedDaily,
      dailyPercentage: Math.min(dailyPercentage, 100),
      dayLimit,
      limit,
      minuteLimit,
      percentage: Math.min(percentage, 100),
    };
  }, [data]);

  const isDailyLimitExceeded =
    rateLimit?.dayLimit !== 0 &&
    rateLimit?.consumedDaily >= rateLimit?.dayLimit;

  const isMonthlyLimitExceeded =
    rateLimit?.limit !== 0 && rateLimit?.consumed >= rateLimit?.limit;

  return (
    <div className="bg-white dark:bg-black-600 dark:text-neargray-10 border soft-shadow rounded-xl p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
        <div className="flex flex-col md:items-center items-start justify-start ">
          <div className="m-2 p-2  md:border-r w-full">
            <h2
              className={`text-lg text-gray-500 dark:text-neargray-10 font-semibold ${
                keyId ? 'mt-1.5' : ''
              }`}
            >
              {keyId ? ' Total API Key Usage' : 'Requests Consumed (Monthly)'}
            </h2>
            {keyId ? (
              !keyDataLoading && keyData ? (
                <>
                  <p className="text-gray-500 dark:text-neargray-10 text-sm">
                    {keyData?.key?.token && `[${keyData?.key?.token}]`}
                  </p>
                  <p className="text-3xl text-nearblue-600 dark:text-neargray-10 font-medium mt-3">
                    {localFormat((keyData?.consumed).toString())}
                  </p>
                </>
              ) : (
                <div className="py-6">
                  <Skeleton className="w-36 h-8" />
                </div>
              )
            ) : !loading ? (
              <>
                <p className="text-3xl text-nearblue-600 dark:text-neargray-10 font-medium">
                  {localFormat(data?.consumed)}
                </p>
                <div className="text-gray-500  dark:text-neargray-10 text-sm mt-2">
                  <p className="flex flex-col md:items-start items-start justify-center">
                    Current rate limit: {data?.minuteLimit} req/min
                  </p>
                </div>
              </>
            ) : (
              <div className="py-6">
                <Skeleton className="w-36 h-8 mt-2" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:items-center items-start justify-start ">
          <div className="m-2 p-2 w-full  md:border-r">
            <h2 className="text-lg text-gray-500 dark:text-neargray-10 font-semibold">
              {'Requests Remaining (24H)'}
            </h2>
            {!loading && data ? (
              <>
                <p className=" text-3xl font-medium text-nearblue-600 dark:text-neargray-10">
                  {localFormat(data?.remainingDaily)}
                </p>
                <div>
                  <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                    <div
                      className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                      style={{
                        width: rateLimit?.dailyPercentage + '%',
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 justify-between mt-1">
                    <p className="text-xs">
                      {localFormat(String(rateLimit?.consumedDaily))} /
                      {localFormat(rateLimit?.dayLimit)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neargray-10">
                      Daily (24H) Quota
                    </p>
                  </div>
                </div>
                {isDailyLimitExceeded && (
                  <p className="text-red-500 dark:text-red-400 ssssss text-xs mt-2">
                    You have exceeded your daily API request limit!
                  </p>
                )}
              </>
            ) : (
              <div className="py-6">
                <Skeleton className="w-36 h-8 mt-2" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:items-center items-start justify-start">
          <div className="m-2 p-2 w-full">
            <h2 className="text-lg text-gray-500 dark:text-neargray-10 font-semibold">
              {'Requests Remaining (Monthly)'}
            </h2>
            {!loading && data ? (
              <>
                <p className=" text-3xl font-medium text-nearblue-600 dark:text-neargray-10">
                  {localFormat(data?.remainingMonthly)}
                </p>
                <div>
                  <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                    <div
                      className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                      style={{
                        width: rateLimit?.percentage + '%',
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 justify-between mt-1">
                    <p className="text-xs">
                      {localFormat(String(rateLimit?.consumed))} /
                      {localFormat(rateLimit?.limit)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neargray-10">
                      Monthly Quota
                    </p>
                  </div>
                </div>
                {isMonthlyLimitExceeded && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                    You have exceeded your monthly API request limit!
                  </p>
                )}
              </>
            ) : (
              <div className="py-6">
                <Skeleton className="w-36 h-8 mt-2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageStats;
