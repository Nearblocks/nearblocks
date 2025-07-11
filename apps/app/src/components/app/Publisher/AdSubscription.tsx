'use client';
import dayjs from 'dayjs';
import get from 'lodash/get';
import React, { useState } from 'react';
import Plan from '@/components/app/Icons/Plan';
import UserLayout from '@/components/app/Layouts/UserLayout';
import SubscriptionStats from '@/components/app/Publisher/SubscriptionStats';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import withAuth from '@/components/app/stores/withAuth';
import useAuth from '@/hooks/app/useAuth';
import { dollarFormat, shortenAddress } from '@/utils/app/libs';

import Tooltip from '@/components/app/common/Tooltip';
import CampaignPagination from '@/components/app/Campaign/CampaignPagination';

const AdSubscription = ({ role }: { role?: string }) => {
  const apiUrl =
    role === 'publisher' ? '/publisher/subscriptions/campaigns?' : '';
  const [url, setUrl] = useState(apiUrl);
  const { data, loading, mutate } = useAuth(url);
  const subscriptions = get(data, 'data') || null;

  return (
    <>
      <UserLayout role={role} title="Campaign Subscriptions">
        <SubscriptionStats />
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4 mt-8">
          <div className="px-5 pt-2 pb-4">
            <p className="text-nearblue-600 dark:text-neargray-10">
              Campaign Subscriptions
            </p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              List all campaign subscriptions
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
                        <td className="px-6 py-4 w-[6.3%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 w-[5%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                        </td>
                        <td className="px-6 py-4 w-[3%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                        </td>
                        <td className="px-6 py-4 w-[2%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 w-[2%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 w-[2%] text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading &&
                    (!subscriptions || subscriptions?.length === 0) && (
                      <tr className="h-[53px]">
                        <td className="text-gray-400 text-xs" colSpan={100}>
                          <div className="w-full bg-white dark:bg-black-600 h-fit">
                            <div className="text-center py-28">
                              <div className="mb-4 flex justify-center">
                                <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                  <Plan />
                                </span>
                              </div>
                              <h3 className="h-5 font-semibold text-lg text-nearblue-600 dark:text-neargray-10">
                                Campaign Subscriptions Empty
                              </h3>
                              <p className="mb-0 py-4 font-semibold text-sm text-gray-500 dark:text-neargray-10">
                                No Campaign Subscriptions Found
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  {subscriptions &&
                    subscriptions?.map((key: any) => (
                      <tr className="hover:bg-blue-900/5" key={key.id}>
                        <td className="px-6 py-4 text-xs text-nearblue-600 dark:text-neargray-10">
                          <Tooltip
                            className={'ml-5 mb-3 left-1/2 max-w-[200px]'}
                            position="top"
                            tooltip={key?.user_email}
                          >
                            <span className="whitespace-nowrap">
                              {shortenAddress(key?.user_email)}
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-green-500 dark:text-green-250">
                          <div className="flex">
                            <p className="mr-2">{key?.campaign_plan_title}</p>
                          </div>
                        </td>
                        {key?.subscription_type === 'monthly' ? (
                          <td className="px-5 py-4 whitespace-nowrap text-sm ">
                            <span className="text-xs">
                              ${dollarFormat(key?.price / 100)}
                              /mo
                            </span>
                          </td>
                        ) : (
                          <td className="px-5 py-4 whitespace-nowrap text-sm ">
                            <span className="text-xs">
                              ${dollarFormat(key?.price / 100)}/yr
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-nearblue-600 dark:text-neargray-10 align-top">
                          {dayjs(key.start_date).format('YYYY-MM-DD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-nearblue-600 dark:text-neargray-10 align-top">
                          {dayjs(key.end_date).format('YYYY-MM-DD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-nearblue-600 dark:text-neargray-10 align-top">
                          {key.status}
                        </td>
                      </tr>
                    ))}
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

export default withAuth(AdSubscription);
