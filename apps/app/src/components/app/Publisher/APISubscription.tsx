'use client';
import dayjs from 'dayjs';
import get from 'lodash/get';
import React, { useState } from 'react';
import Plan from '@/components/app/Icons/Plan';
import UserLayout from '@/components/app/Layouts/UserLayout';
import SubscriptionStats from '@/components/app/Publisher/SubscriptionStats';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import useAuth from '@/hooks/app/useAuth';
import { dollarFormat, localFormat } from '@/utils/app/libs';
import Tooltip from '../common/Tooltip';
import withAuth from '../stores/withAuth';
import CampaignPagination from '../Campaign/CampaignPagination';

const APISubscription = ({ role }: { role?: string }) => {
  const apiUrl = role === 'publisher' ? '/publisher/subscriptions/api?' : '';
  const [url, setUrl] = useState(apiUrl);

  const { data, loading, mutate } = useAuth(url);

  const subscriptions = get(data, 'data') || null;

  return (
    <>
      <UserLayout role={role} title="API Subscriptions">
        <SubscriptionStats type="api" />
        <div className="w-full pt-2 pb-2 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4 mt-8">
          <div className="px-5 pt-2 pb-4">
            <p className="text-nearblue-600 dark:text-neargray-10">
              API Subscriptions
            </p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              List all api Subscriptions
            </p>
          </div>
          <div className="flex">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                  <tr>
                    <th
                      className="px-3 py-4 w-[5.5%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      <div className="pl-2">USER</div>
                    </th>
                    <th
                      className="px-3 py-4 w-[8.3%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      PLAN
                    </th>
                    <th
                      className="px-3 py-4 w-[7.5%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      PRICE
                    </th>
                    <th
                      className="px-3 py-4 w-[2%] text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      START DATE
                    </th>
                    <th
                      className="px-3 py-4 w-[2%] text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      END DATE
                    </th>
                    <th
                      className="px-3 py-4 w-[2%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      STATUS
                    </th>
                    <th
                      className="px-3 py-4 text-start text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                      scope="col"
                    >
                      <div className="pl-3">Requests Remaining (24H)</div>
                    </th>
                    <th
                      className="px-3 py-4 text-start text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                      scope="col"
                    >
                      <div className="pl-3">Requests Remaining (Monthly)</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(3)].map((_, i) => (
                      <tr className="hover:bg-blue-900/5 h-[80px]" key={i}>
                        <td className="w-[8.4%] px-5 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[1%] px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[3%] px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[20%] px-3 py-2 pl-6 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[4%] px-3 py-2 pl-6 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading &&
                    (!subscriptions || subscriptions?.length === 0) && (
                      <tr className="h-[53px]">
                        <td className="text-gray-500 text-xs" colSpan={100}>
                          <div className="w-full bg-white dark:bg-black-600 h-fit">
                            <div className="text-center py-28">
                              <div className="mb-4 flex justify-center">
                                <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                  <Plan />
                                </span>
                              </div>
                              <h3 className="h-5 font-semibold text-lg text-nearblue-600 dark:text-neargray-10">
                                API Keys Empty
                              </h3>
                              <p className="mb-0 py-4 font-semibold text-sm text-gray-500 dark:text-neargray-10">
                                No API Key Found
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                  {subscriptions &&
                    subscriptions?.map((key: any) => {
                      const dailyPercentage =
                        key.dayLimit > 0
                          ? (key.consumedDaily / key.dayLimit) * 100
                          : 0;
                      const monthlyPercentage =
                        key.monthLimit > 0
                          ? (key.consumed / key.monthLimit) * 100
                          : 0;
                      return (
                        <tr className="hover:bg-blue-900/5" key={key.id}>
                          <td className="px-5 py-2.5 text-xs text-nearblue-600 dark:text-neargray-10 max-w-52 text-ellipsis pt-6">
                            <Tooltip
                              className="left-24 mb-3 max-w-[200px]"
                              position="top"
                              tooltip={key?.user_email}
                            >
                              <span className="whitespace-nowrap inline-block truncate max-w-[80px]">
                                {key?.username}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-3 text-xs text-green-500 dark:text-green-250 whitespace-nowrap pt-6">
                            <p>{key?.campaign_plan_title}</p>
                          </td>
                          <td className="px-3 py-3 text-xs text-nearblue-600 dark:text-neargray-10 whitespace-nowrap pt-6">
                            <span>
                              ${dollarFormat(key?.price / 100)}
                              {key?.subscription_type === 'monthly'
                                ? '/mo'
                                : '/yr'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-nearblue-600 dark:text-neargray-10 whitespace-nowrap pt-6">
                            {dayjs(key.start_date).format('YYYY-MM-DD')}
                          </td>
                          <td className="px-3 py-3 text-xs text-nearblue-600 dark:text-neargray-10 whitespace-nowrap pt-6">
                            {dayjs(key.end_date).format('YYYY-MM-DD')}
                          </td>
                          <td className="px-3 py-3 text-xs text-nearblue-600 dark:text-neargray-10 whitespace-nowrap pt-6">
                            {key.status}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600 dark:text-neargray-10 w-60 align-middle">
                            <div className="flex flex-col items-start px-3 hover:bg-neargreen/5 dark:hover:bg-black-200">
                              <p className="text-sm font-semibold text-nearblue-600 dark:text-neargray-10">
                                {localFormat(key?.remainingDaily)}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                                <div
                                  className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                                  style={{
                                    width: `${dailyPercentage}%`,
                                    maxWidth: '100%',
                                  }}
                                ></div>
                              </div>
                              <div className="flex whitespace-nowrap text-xs mt-1">
                                <p>
                                  {localFormat(String(key?.consumedDaily))} /{' '}
                                  {localFormat(key?.dayLimit)}
                                </p>
                                <p className="text-gray-500 dark:text-neargray-50 mx-1">
                                  Daily (24H) Quota
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600 dark:text-neargray-10 w-60 text-center">
                            <div className="flex flex-col items-start px-3 hover:bg-neargreen/5 dark:hover:bg-black-200">
                              <p className="text-sm font-semibold text-nearblue-600 dark:text-neargray-10">
                                {localFormat(key?.remainingMonthly)}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                                <div
                                  className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                                  style={{
                                    width: `${monthlyPercentage}%`,
                                    maxWidth: '100%',
                                  }}
                                ></div>
                              </div>
                              <div className="flex whitespace-nowrap text-xs mt-1">
                                <p>
                                  {localFormat(String(key?.consumed))} /{' '}
                                  {localFormat(key?.monthLimit)}
                                </p>
                                <p className="text-gray-500 dark:text-neargray-50 mx-1">
                                  Monthly Quota
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <CampaignPagination
            nextPageUrl={data?.links?.next}
            prevPageUrl={data?.links?.prev}
            firstPageUrl={data?.links?.first}
            currentPage={data?.meta?.current_page}
            setUrl={setUrl}
            mutate={mutate}
            isLoading={loading}
          />
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(APISubscription);
