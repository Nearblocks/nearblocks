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
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4 mt-8">
          <div className="px-5 pt-2 pb-4">
            <p className="text-black dark:text-neargray-10">
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
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      USER
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      PLAN
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      PRICE
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      START DATE
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      END DATE
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      STATUS
                    </th>
                    <th
                      className="px-6 py-4 text-center text-xs w-6 font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Requests Remaining (24H)
                    </th>
                    <th
                      className="px-6 py-4 text-center text-xs w-6 font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Requests Remaining (Monthly)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(2)].map((_, i) => (
                      <tr className="hover:bg-blue-900/5 h-[100px]" key={i}>
                        <td className="w-[5.5%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[8.3%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                        </td>
                        <td className="w-[7.5%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[2%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[7%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[5.5%] px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
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
                              <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                                API Keys Empty
                              </h3>
                              <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
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
                          <td className="px-6 py-4 text-xs text-black pt-6 dark:text-neargray-10 align-middle max-w-52 text-ellipsis">
                            <Tooltip
                              className={'left-25 mb-3 max-w-[200px]'}
                              position="top"
                              tooltip={key?.user_email}
                            >
                              <span className="whitespace-nowrap inline-block truncate max-w-[100px]">
                                {key?.username}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-green-500 dark:text-green-250 align-middle">
                            <div className="flex">
                              <p className="mr-2">{key?.campaign_plan_title}</p>
                            </div>
                          </td>
                          {key?.subscription_type === 'monthly' ? (
                            <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-black dark:text-neargray-10 align-middle">
                              <span>
                                ${dollarFormat(key?.price / 100)}
                                /mo
                              </span>
                            </td>
                          ) : (
                            <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-black dark:text-neargray-10 align-middle">
                              <span>
                                ${dollarFormat(key?.price / 100)}
                                /yr
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-black dark:text-neargray-10 align-middle">
                            {dayjs(key.start_date).format('YYYY-MM-DD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-black dark:text-neargray-10 align-middle">
                            {dayjs(key.end_date).format('YYYY-MM-DD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs pt-6 text-black dark:text-neargray-10 align-middle">
                            {key.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                            <div className="flex flex-col items-center px-2 hover:bg-neargreen/5 dark:hover:bg-black-200">
                              <>
                                <p className="text-sm font-bold text-black dark:text-neargray-10">
                                  {localFormat(key?.remainingDaily)}
                                </p>
                                <div>
                                  <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                                    <div
                                      className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                                      style={{
                                        maxWidth: '100%',
                                        width: `${dailyPercentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 justify-between mt-1">
                                    <p className="text-xs">
                                      {localFormat(String(key?.consumedDaily))}{' '}
                                      / {localFormat(key?.dayLimit)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-neargray-50">
                                      Daily (24H) Quota
                                    </p>
                                  </div>
                                </div>
                              </>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-neargray-10 align-top">
                            <div className="flex flex-col items-center px-2 hover:bg-neargreen/5 dark:hover:bg-black-200">
                              <>
                                <p className="text-sm font-bold text-black dark:text-neargray-10">
                                  {localFormat(key?.remainingMonthly)}
                                </p>
                                <div>
                                  {/* Progress bar for daily usage */}
                                  <div className="w-full bg-gray-200 dark:bg-neargray-50 h-2 rounded-full mt-2">
                                    <div
                                      className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                                      style={{
                                        maxWidth: '100%',
                                        width: `${monthlyPercentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 justify-between mt-1">
                                    <p className="text-xs">
                                      {localFormat(String(key?.consumed))} /{' '}
                                      {localFormat(key?.monthLimit)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-neargray-50">
                                      Monthly Quota
                                    </p>
                                  </div>
                                </div>
                              </>
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
