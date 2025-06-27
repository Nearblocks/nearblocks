'use client';
import dayjs from 'dayjs';
import get from 'lodash/get';
import React, { useState } from 'react';
import Plan from '@/components/app/Icons/Plan';
import UserLayout from '@/components/app/Layouts/UserLayout';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import withAuth from '@/components/app/stores/withAuth';
import useAuth from '@/hooks/app/useAuth';
import { Link } from '@/i18n/routing';
import Tooltip from '@/components/app/common/Tooltip';
import CampaignPagination from '@/components/app/Campaign/CampaignPagination';
import { shortenAddress } from '@/utils/app/libs';

interface ApiKey {
  created_at: string;
  id: string;
  name: string;
  token: string;
  usage: string;
  user: {
    email: string;
    username: string;
  };
}

const Keys = ({ role }: { role?: string }) => {
  const apiUrl = role === 'publisher' ? '/publisher/keys?' : '';
  const [url, setUrl] = useState(apiUrl);
  const { data, loading, mutate } = useAuth(url);
  const keys = get(data, 'keys') || null;

  return (
    <>
      <UserLayout role={role} title="API Keys">
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4">
          <div className="px-5 pt-2 pb-4">
            <p className="text-nearblue-600 dark:text-neargray-10">API Keys</p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              {role === 'publisher'
                ? `List all api keys`
                : `For developers interested in building applications using our API
              Service, please create an API-Key Token usable for all API
              requests.`}
            </p>
          </div>
          <div className="flex">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      APP NAME
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      USER
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      API KEY TOKEN
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Current Usage (Monthly)
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr
                        className="hover:bg-blue-900/5 h-[53px] w-full"
                        key={i}
                      >
                        <td className="w-[5%] px-6 py-4 align-top text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[6.7%] px-6 py-4 align-top text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="w-[6.3%] px-6 py-4 align-top text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-32 mt-2" />
                        </td>
                        <td className="w-[10%] px-6 py-4 align-top text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 w-25" />
                        </td>
                        <td className="w-[4.5%] px-6 py-4  align-top ml-10 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 w-10" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!keys || keys?.data.length === 0) && (
                    <tr className="h-[53px]">
                      <td className="text-gray-600 text-xs" colSpan={100}>
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

                  {keys?.data.map((key: ApiKey) => (
                    <tr className="hover:bg-blue-900/5" key={key.id}>
                      <td className="px-6 py-4  text-xs text-nearblue-600 dark:text-neargray-10 align-top max-w-52 text-ellipsis">
                        <Tooltip
                          className={'left-1/2 mb-3 max-w-[200px] '}
                          position="top"
                          tooltip={key?.name}
                        >
                          <span className="whitespace-nowrap inline-block truncate max-w-[120px]">
                            {key?.name}
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4  text-xs text-nearblue-600 dark:text-neargray-10 align-top max-w-52 text-ellipsis">
                        <Tooltip
                          className={'left-1/2 max-w-[200px]'}
                          position="top"
                          tooltip={key?.user?.email}
                        >
                          <span className="whitespace-nowrap inline-block truncate max-w-[120px]">
                            {key?.user?.username}
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-green-500 dark:text-green-250 align-top">
                        <div className="flex">
                          <p className="mr-2">{shortenAddress(key?.token)}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-neargray-10">
                          Added on {dayjs(key.created_at).format('YYYY-MM-DD')}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-nearblue-600 dark:text-neargray-10 align-top">
                        {key.usage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex  items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                        <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200">
                          <Link
                            className="flex items-center"
                            href={`/publisher/apiusage?id=${key?.id}`}
                            passHref
                          >
                            <p className="text-green-500 dark:text-green-250 cursor-pointer">
                              Stats
                            </p>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <CampaignPagination
            currentPage={keys?.current_page}
            firstPageUrl={keys?.first_page_url}
            mutate={mutate}
            nextPageUrl={keys?.next_page_url}
            prevPageUrl={keys?.prev_page_url}
            setUrl={setUrl}
            isLoading={loading}
          />
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(Keys);
